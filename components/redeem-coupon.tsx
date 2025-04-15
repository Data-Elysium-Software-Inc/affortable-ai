// components/RedeemCoupon.tsx

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// Import necessary icons and loading component
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react"; // If you're using Lucide icons

export function RedeemCoupon({ onRedeemed }: { onRedeemed?: () => void }) {
  const [couponCode, setCouponCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemCoupon = async () => {
    if (!couponCode) {
      toast.error("Coupon code is required");
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Coupon Redeemed");

        if (onRedeemed) {
          onRedeemed();
        }
      } else {
        toast.error(data.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      toast.error("An internal error occurred");
    } finally {
      setIsRedeeming(false);
      setCouponCode("");
    }
  };

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2">Redeem Coupon</div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={handleRedeemCoupon}
          disabled={isRedeeming || !couponCode}
          aria-label="Redeem Coupon"
          className="h-[34px] px-4"
        >
          {isRedeeming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRightIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}