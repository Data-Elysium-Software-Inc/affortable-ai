"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import Terms from "@/components/Terms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import GoogleSignInButton from "@/components/GoogleLoginButton";
import { signIn } from "next-auth/react";

import { register, type RegisterActionState } from "../actions";

// Separate component for handling search parameters with Suspense
function SearchParamsHandler({
  setRef,
}: {
  setRef: (ref: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    setRef(ref); // Pass the ref to the parent component
  }, [ref, setRef]);

  return null; // No UI needed for this component
}


export default function RegisterPage() {
  const router = useRouter();
  const [ref, setRef] = useState<string | null>(null); // Store the "ref" parameter

  const { theme } = useTheme();
  const logoSrc =
    theme === "light"
      ? "/images/logo/logo-light.png"
      : "/images/logo/logo-dark.png";

  // Steps: 1 -> "send_otp", 2 -> "verify_otp", 3 -> "set_password"
  const [currentStep, setCurrentStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


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

  /**
   *  - Step 1: send_otp
   *  - Step 2: verify_otp
   *  - Step 3: set_password
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    const formData = new FormData();
    if (currentStep === 1) {
      formData.append("step", "send_otp");
      formData.append("email", email);
      if (ref) formData.append("ref", ref);
    } else if (currentStep === 2) {
      formData.append("step", "verify_otp");
      formData.append("email", email);
      formData.append("otp", otp);
    } else if (currentStep === 3) {
      formData.append("step", "set_password");
      formData.append("email", email);
      formData.append("otp", otp);
      if (ref) formData.append("ref", ref);
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }
      formData.append("password", password);
    }

    try {
      const result = await register({ status: "idle" } as RegisterActionState, formData);

      switch (result.status) {
        case "user_exists":
          toast.error("Account already exists");
          break;
        case "failed":
          toast.error("Failed to create account");
          break;
        case "invalid_data":
          toast.error("Invalid data provided");
          break;
        case "email_sent":
          toast.success("OTP sent to your email");
          setCurrentStep(2);
          setResendTimer(60);
          setCanResendOtp(false);
          break;
        case "invalid_otp":
          toast.error("Invalid or expired OTP");
          break;
        case "referral_limit_reached":
          toast.error("Referral limit reached");
          break;
        case "otp_verified":
          toast.success("OTP verified, please set your password");
          setCurrentStep(3);
          break;
        case "success":
            toast.success("Account created successfully");
            router.push("/");
          break;
        default:
          toast.error("An unexpected error occurred. Please try again.");
          break;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("step", "send_otp");
      formData.append("email", email);
      if (ref) formData.append("ref", ref);

      const result = await register({ status: "idle" } as RegisterActionState, formData);

      if (result.status === "email_sent") {
        toast.success("OTP has been resent to your email.");
        // Reset timer
        setResendTimer(60);
        setCanResendOtp(false);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error while resending OTP:", error);
      toast.error("An unexpected error occurred while resending OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler setRef={setRef} />
      </Suspense>
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
        {/* Header / Logo */}
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <Image src={logoSrc} height={100} width={100} alt="Logo" />
          <h3 className="text-md md:text-xl font-semibold dark:text-zinc-50">
            Join Now – Your All-in-One AI Awaits! ✨
          </h3>
          <p className="text-sm text-gray-800 dark:text-zinc-300">
            Unlock latest powerful AI solutions like ChatGPT, Claude, Gemini, Dall-e!
          </p>
        </div>

        {/* Google Sign Up Button */}
        {
          currentStep === 1 && (
            <div>
              <div className="mt-4">
                <GoogleSignInButton
                  onClick={(e) => {
                    e.preventDefault();
                    signIn('google', {
                      redirect: false,
                    })
                      .then((res) => console.log("Success:", res))
                      .catch((err) => console.error("Login error:", err));
                  }}
                  content="Sign Up with Google"
                />
              </div>
              <div className="relative mt-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-gray-500 dark:text-gray-400">OR</span>
                </div>
              </div>
            </div>
          )
        }
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          {/* Step 1: Email */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Step 2: OTP */}
          {currentStep === 2 && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  className="bg-muted text-md md:text-sm"
                  type="text"
                  placeholder="Enter the OTP sent to your email"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {/* Resend OTP button with countdown */}
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

          {/* Step 3: Password Fields */}
          {currentStep === 3 && (
            <>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="text-zinc-600 font-normal dark:text-zinc-400"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  className="bg-muted text-md md:text-sm"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-zinc-600 font-normal dark:text-zinc-400"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  className="bg-muted text-md md:text-sm"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
              <Label htmlFor="ref" className="text-zinc-600 font-normal dark:text-zinc-400">
                Referral Coupon (Optional)
              </Label>
              <Input
                id="ref"
                name="ref"
                className="bg-muted text-md md:text-sm"
                type="text"
                placeholder="Enter referral coupon"
                value={ref || ""}
                onChange={(e) => setRef(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1 dark:text-zinc-400">
                If you have a referral coupon, enter it here.
              </p>
            </div>
            </>
          )}

          {/* Submit Button */}
          <SubmitButton isSuccessful={false} disabled={isLoading}>
            {isLoading
              ? currentStep === 1
                ? "Sending OTP..."
                : currentStep === 2
                  ? "Verifying..."
                  : "Registering..."
              : currentStep === 1
                ? "Send OTP"
                : currentStep === 2
                  ? "Verify OTP"
                  : "Sign Up"}
          </SubmitButton>

          {/* Extra text for password step */}
          {currentStep === 3 && (
            <p className="text-center text-xs text-gray-600 mt-0 dark:text-zinc-400">
              Password must be at least 6 characters
            </p>
          )}

          {/* Terms hint (only show on Step 1) */}
          {currentStep === 1 && (
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"By signing up, you agree to our "}
            <button
              type="button" // Prevent form submission
              onClick={() => setIsModalOpen(true)}
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Terms and Conditions
            </button>
            {"."}
          </p>
          )}

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline dark:text-zinc-200">
              Sign in
            </Link>{" "}
            instead.
          </p>
        </form>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false); // Close modal when clicking outside
            }
          }}
        >
          <div className="relative bg-white rounded-lg shadow-lg max-w-[90%] md:max-w-4xl w-full max-h-[90%] overflow-y-auto p-6">
            <Terms onClose={() => setIsModalOpen(false)} />{" "}
            {/* Pass the onClose handler */}
          </div>
        </div>
      )}

    </div>
  );
}
