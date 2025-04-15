// components/pay-button.tsx

// export function PayButton({
//   paymentLink,
//   className,
// }: {
//   paymentLink: string;
//   className?: string;
// }) {
//   const handleRedirect = () => {
//     window.location.href = paymentLink;
//   };

//   return (
//     <Button
//       variant="outline"
//       className={`flex items-center justify-center ${className} px-3`}
//       onClick={handleRedirect}
//     >
//       Buy Credit
//     </Button>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  CheckCircleFillIcon,
  ChevronDownIcon,
} from "./icons";

import { RedeemCoupon } from "./redeem-coupon";

export function PayButton({
  paymentLink,
  className,
  openPopUp,
}: {
  paymentLink: string;
  className?: string;
  openPopUp: () => void; // Ensuring correct function type
}) {
  const [open, setOpen] = useState(false);
  const currentTime = new Date();
  const startTime = new Date("2025-03-30T18:00:00+06:00");
  const endTime = new Date("2025-04-01T00:00:00+06:00");
  const isBonusPeriod = currentTime >= startTime && currentTime < endTime;

  const handleRedirect = () => {
    window.open(paymentLink, "_blank");
  };

  const handleCouponRedeemed = () => {
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button variant="outline" className="px-2 md:flex md:px-2 md:h-[34px]">
          Buy
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      {/* THIS IS JUST A RANDOM COMMENT */}

      <DropdownMenuContent align="start" className="min-w-[300px]">
        <DropdownMenuItem
          onSelect={() => {
            // setVisibilityType(visibility.id);
            setOpen(false);
          }}
          onClick={handleRedirect}
          className="gap-4 group/item flex flex-row justify-between items-center"
          // data-active={visibility.id === visibilityType}
        >
          <div className="flex flex-col gap-1 items-start font-semibold">
            STRIPE
            <div className="text-xs text-muted-foreground">
              Buy Credits using your Card
            </div>
          </div>
          <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
            <CheckCircleFillIcon />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            setOpen(false);
          }}
          onClick={openPopUp }
          className="gap-4 group/item flex flex-row justify-between items-center"
        >
          <div className="flex flex-col gap-1 items-start">
              <div>
                Bkash{isBonusPeriod ? (<span className="text-green-600 dark:text-green-400"> 11% extra credit bonus!</span>) : ""}
              </div>
            <div className="text-xs text-muted-foreground">
              Buy Credits using your Bkash online
            </div>
          </div>
          <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
            <CheckCircleFillIcon />
          </div>
        </DropdownMenuItem>
        <RedeemCoupon onRedeemed={handleCouponRedeemed} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
