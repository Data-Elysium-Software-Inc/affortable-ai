// pages/forgot-password.tsx or app/forgot-password/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

import { 
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../actions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const logoSrc =
    theme === "light"
      ? "/images/logo/logo-light.png"
      : "/images/logo/logo-dark.png";

  // State variables
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 2 && !canResendOtp) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, canResendOtp]);

  // Handle sending OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);

    const result = await forgotPassword({ status: "idle" }, formData);

    setIsLoading(false);

    if (result.status === "success") {
      toast.success("OTP has been sent to your email.");
      setCurrentStep(2);
      setResendTimer(60);
      setCanResendOtp(false);
    } else if (result.status === "user_not_found") {
      toast.error("Account with this email does not exist.");
    } else if (result.status === "invalid_data") {
      toast.error("Please enter a valid email address.");
    } else {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  // Handle verifying OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);

    const result = await verifyOtp({ status: "idle" }, formData);

    setIsLoading(false);

    if (result.status === "success") {
      toast.success("OTP verified. Please reset your password.");
      setCurrentStep(3);
    } else if (result.status === "invalid_otp") {
      toast.error("Invalid or expired OTP.");
    } else {
      toast.error("Failed to verify OTP. Please try again.");
    }
  };

  // Handle resetting password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("password", password);

    const result = await resetPassword({ status: "idle" }, formData);

    setIsLoading(false);

    if (result.status === "success") {
      toast.success("Password reset successful. Please log in.");
      router.push("/login");
    } else if (result.status === "invalid_data") {
      toast.error("Password must be at least 6 characters long.");
    } else if (result.status === "invalid_otp") {
      toast.error("Invalid or expired OTP.");
    } else {
      toast.error("Failed to reset password. Please try again.");
    }
  };

  // Handle resending OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);

    const result = await forgotPassword({ status: "idle" }, formData);

    setIsLoading(false);

    if (result.status === "success") {
      toast.success("OTP has been resent to your email.");
      setResendTimer(60);
      setCanResendOtp(false);
    } else {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background mt-[-50]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <Image src={logoSrc} height={150} width={150} alt="Logo" />

          <h3 className="text-md font-semibold dark:text-zinc-50 mt-3">
            Forgot Your Password?
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {currentStep === 1 &&
              "Enter your email to receive a password reset OTP"}
            {currentStep === 2 &&
              "Enter the OTP sent to your email (Check spam if not found)"}
            {currentStep === 3 && "Set your new password"}
          </p>
        </div>
        <form
          onSubmit={
            currentStep === 1
              ? handleSendOtp
              : currentStep === 2
              ? handleVerifyOtp
              : handleResetPassword
          }
          className="flex flex-col gap-4 px-4 sm:px-16"
        >
          {currentStep === 1 && (
            <>
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-zinc-600 font-normal dark:text-zinc-400"
                >
                  Email Address
                </Label>

                <Input
                  id="email"
                  name="email"
                  className="bg-muted text-md md:text-sm"
                  type="email"
                  placeholder="user@example.com"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/* Submit Button */}
              <SubmitButton isSuccessful={false} disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </SubmitButton>
              <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="font-bold text-teal-700 text-base hover:underline dark:text-zinc-200"
                >
                  Sign in
                </a>
              </p>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* OTP Input */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="otp"
                  className="text-zinc-600 font-normal dark:text-zinc-400"
                >
                  OTP
                </Label>

                <Input
                  id="otp"
                  name="otp"
                  className="bg-muted text-md md:text-sm"
                  type="text"
                  placeholder="Enter the OTP"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {/* Submit Button */}
              <SubmitButton isSuccessful={false} disabled={isLoading}>
                {isLoading ? "Verifying OTP..." : "Verify OTP"}
              </SubmitButton>
              {/* Resend OTP */}
              <button
                type="button"
                onClick={handleResendOtp}
                className={
                  canResendOtp
                    ? "text-teal-700 hover:underline mt-2"
                    : "text-gray-500 cursor-not-allowed mt-2"
                }
                disabled={!canResendOtp || isLoading}
              >
                {canResendOtp ? "Resend OTP" : `Resend OTP in ${resendTimer}s`}
              </button>
            </>
          )}

          {currentStep === 3 && (
            <>
              {/* New Password Input */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="text-zinc-600 font-normal dark:text-zinc-400"
                >
                  New Password
                </Label>

                <Input
                  id="password"
                  name="password"
                  className="bg-muted text-md md:text-sm"
                  type="password"
                  placeholder="Enter your new password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Confirm New Password Input */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-zinc-600 font-normal dark:text-zinc-400"
                >
                  Confirm New Password
                </Label>

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  className="bg-muted text-md md:text-sm"
                  type="password"
                  placeholder="Re-enter your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {/* Submit Button */}
              <SubmitButton isSuccessful={false} disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </SubmitButton>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
