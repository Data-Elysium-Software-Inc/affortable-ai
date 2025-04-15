"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth-form";
import { SubmitButton } from "@/components/submit-button";
import Image from "next/image";
import { useTheme } from "next-themes";
import { signIn } from "next-auth/react";
import GoogleSignInButton from "@/components/GoogleLoginButton";

import { login, type LoginActionState } from "../actions";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const { setTheme, theme } = useTheme();
  const [isSuccessful, setIsSuccessful] = useState(false);
  const logoSrc =
    theme === "light"
      ? "/images/logo/logo-light.png"
      : "/images/logo/logo-dark.png";

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    }
  );

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Invalid credentials!");
    } else if (state.status === "invalid_data") {
      toast.error("Please recheck your mail and password!");
    } else if (state.status === "success") {
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background mt-[-50]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <Image
            src={logoSrc}
            height={150}
            width={150}
            alt="Data Elysium Logo"
          />
          {/* {logoSrc} */}

          <h3 className="text-md font-semibold dark:text-zinc-50 mt-3">
            {" "}
            Welcome to Affortable AI
          </h3>
          {/* <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3> */}
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
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
            content="Sign in with Google"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-bold text-teal-700 text-base hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {" for free."}
          </p>

          {/* Added Forgot Password Link */}
          <p className="text-center text-sm text-gray-600 mt-2 dark:text-zinc-400">
            <Link
              href="/forgot-password"
              className="font-bold text-teal-700 text-base hover:underline dark:text-zinc-200"
            >
              Forgot Password?
            </Link>
          </p>
        </AuthForm>
      </div>
    </div>
  );
}