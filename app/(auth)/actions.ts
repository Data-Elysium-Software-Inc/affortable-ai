'use server';

import { z } from 'zod';

import {
  createUser,
  getUser,
  updateUserOtp,
  updateUserPassword,
  clearUserOtp,
  saveTemporaryUser,
  getTemporaryUserByEmail,
  updateTemporaryUserOtp,
  deleteTemporaryUserByEmail,
  updateReferralUsageByOne,
  updateUserReferralInfo,
} from '@/lib/db/queries';
import { sendOtpEmail } from '@/lib/mailer/email';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
  | 'idle'
  | 'in_progress'
  | 'email_sent'
  | 'otp_verified'
  | 'success'
  | 'failed'
  | 'user_exists'
  | 'invalid_data'
  | 'invalid_otp'
  | 'referral_limit_reached'
  | 'invalid_reffaral_code';
}

export const register = async (
  state: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const step = formData.get('step') || 'send_otp';

    switch (step) {
      case 'send_otp': {
        const email = formData.get('email') as string;

        const emailSchema = z.string().email();
        const validatedEmail = emailSchema.parse(email);

        const [existingUser] = await getUser(validatedEmail);
        if (existingUser) {
          return { status: 'user_exists' };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        const existingTempUser = await getTemporaryUserByEmail(validatedEmail);
        if (existingTempUser) {
          await updateTemporaryUserOtp(validatedEmail, otp, otpExpires);
        } else {
          await saveTemporaryUser(validatedEmail, otp, otpExpires);
        }

        await sendOtpEmail(validatedEmail, otp, 'signup');

        return { status: 'email_sent' };
      }

      case 'verify_otp': {
        const email = formData.get('email') as string;
        const otp = formData.get('otp') as string;

        if (!email || !otp) {
          return { status: 'invalid_data' };
        }

        const tempUser = await getTemporaryUserByEmail(email);
        if (
          !tempUser ||
          tempUser.otp !== otp ||
          new Date() > tempUser.otpExpires
        ) {
          return { status: 'invalid_otp' };
        }

        return { status: 'otp_verified' };
      }

      case 'set_password': {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const ref = formData.get('ref') as string | null;

        const passwordSchema = z.string().min(6);
        const validatedPassword = passwordSchema.parse(password);

        const tempUser = await getTemporaryUserByEmail(email);
        if (!tempUser) {
          return { status: 'failed' };
        }

        await createUser(email, true, 'email', validatedPassword, ref);

        await deleteTemporaryUserByEmail(email);

        await signIn('credentials', {
          email,
          password: validatedPassword,
          redirect: false,
        });

        return { status: 'success' };
      }

      default:
        return { status: 'invalid_data' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    if (error instanceof Error && error.message === 'ReferralCodeLimitReached') {
      return { status: 'referral_limit_reached' };
    }

    console.error('Registration failed', error);
    return { status: 'failed' };
  }
};

export const registerOAuth = async (
  formData: FormData
): Promise<RegisterActionState> => {
  const id = formData.get('id') as string;
  const ref = formData.get('ref') as string | null;

  if (!id) {
    return { status: 'invalid_data' };
  }

  const refInfo = await updateReferralUsageByOne(ref);
  if (!refInfo && ref !== null && ref !== '') {
    return { status: 'invalid_reffaral_code' };
  }

  await updateUserReferralInfo(id, true, refInfo?.code, refInfo?.amount)

  return { status: 'success' };
}


export interface ForgotPasswordActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'user_not_found' | 'invalid_data';
}

export const forgotPassword = async (
  _: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> => {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return { status: 'invalid_data' };
    }

    const [userRecord] = await getUser(email);

    if (!userRecord) {
      return { status: 'user_not_found' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

    await updateUserOtp(userRecord.id, otp, otpExpires);

    await sendOtpEmail(email, otp, 'reset');

    return { status: 'success' };
  } catch (error) {
    console.error('Failed to handle forgot password action', error);
    return { status: 'failed' };
  }
}

export interface VerifyOtpActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_otp' | 'invalid_data';
}

export const verifyOtp = async (
  _: VerifyOtpActionState,
  formData: FormData,
): Promise<VerifyOtpActionState> => {
  try {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;

    if (!email || !otp) {
      return { status: 'invalid_data' };
    }

    const [userRecord] = await getUser(email);

    if (!userRecord) {
      return { status: 'invalid_data' };
    }

    if (
      userRecord.resetPasswordOtp !== otp ||
      !userRecord.resetPasswordOtpExpires ||
      new Date() > userRecord.resetPasswordOtpExpires
    ) {
      return { status: 'invalid_otp' };
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Failed to verify OTP', error);
    return { status: 'failed' };
  }
};

export interface ResetPasswordActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_otp' | 'invalid_data';
}

export const resetPassword = async (
  _: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> => {
  try {
    const formDataObject = {
      email: formData.get('email'),
      otp: formData.get('otp'),
      password: formData.get('password'),
    };

    const validatedData = resetPasswordSchema.parse(formDataObject);

    const [userRecord] = await getUser(validatedData.email);

    if (!userRecord) {
      return { status: 'invalid_data' };
    }

    if (
      userRecord.resetPasswordOtp !== validatedData.otp ||
      !userRecord.resetPasswordOtpExpires ||
      new Date() > userRecord.resetPasswordOtpExpires
    ) { 
      return { status: 'invalid_otp' };
    }

    await updateUserPassword(userRecord.id, validatedData.password);

    await clearUserOtp(userRecord.id);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    console.error('Failed to reset password', error);
    return { status: 'failed' };
  }
};