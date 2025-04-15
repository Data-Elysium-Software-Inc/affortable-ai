"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Terms from "@/components/Terms";
import { SubmitButton } from "@/components/submit-button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerOAuth } from "../../actions";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const logoSrc =
    theme === "light"
      ? "/images/logo/logo-light.png"
      : "/images/logo/logo-dark.png";

  const [ref, setRef] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, update } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    const id = session?.user?.id;
    if (!id) return;
    formData.append("id", id);
    if (ref && ref !== "") formData.append("ref", ref);
    console.log("Form data:", formData);

    setIsLoading(true);
    const state = await registerOAuth(formData);
    setIsLoading(false);

    if (state.status !== 'success') {
      toast.error("Invalid Referral Code");
      return;
    }

    await update({
      ...session,
      user: {
        ...session?.user,
        registrationComplete: true,
      },
    })

    if (ref && ref !== "") {
      toast.success("Referral Code Applied Successfully");
    }
    router.push("/"); // Redirect to home page

  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl flex flex-col gap-8">
        {/* Header / Logo */}
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <Image src={logoSrc} height={100} width={100} alt="Logo" />
          <h3 className="text-md md:text-xl font-semibold dark:text-zinc-50">
            Join Now – Your All-in-One AI Awaits! ✨
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16 mt-5">
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

            <SubmitButton isSuccessful={false} disabled={isLoading}>
              {ref == null || ref == "" ? "Skip" : "Submit"}
            </SubmitButton>
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
          </form>
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
      </div>
    </div>
  );

}