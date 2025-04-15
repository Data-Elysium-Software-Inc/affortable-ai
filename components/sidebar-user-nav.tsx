'use client';
import { useEffect, useState } from 'react';
import { ChevronUp, Copy } from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import PriceCalculatorPopup from '@/components/price-calculator-popup'; // Import popup component
import CustomerSupportPopup from './customer-support-popup';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();
  const [referralCoupon, setReferralCoupon] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Track popup state
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Fetch referral coupon when the component loads
  useEffect(() => {
    async function fetchReferralCoupon() {
      if (user?.email) {
        try {
          const response = await fetch(`/api/referral?email=${user.email}`);
          const data = await response.json();

          if (response.ok && data.referralCoupon) {
            setReferralCoupon(data.referralCoupon);
          } else {
            setReferralCoupon('Not available');
          }
        } catch (error) {
          console.error('Failed to fetch referral coupon:', error);
          setReferralCoupon('Error fetching coupon');
        }
      }
    }

    fetchReferralCoupon();
  }, [user?.email]);


  const handleCopy = () => {
    if (referralCoupon) {
      navigator.clipboard.writeText(referralCoupon);
      toast.success('Referral coupon copied to clipboard!', {
        duration: 3000,
      });
    }
  };

  const router = useRouter();


  return (<>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setIsPopupOpen(true)} // Open popup
            >
              Price Calculator
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setIsSupportOpen(true)} // Open popup
            >
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Referral Coupon:
                </span>
                {referralCoupon ? (
                  <div role="button"
                    className="flex items-center gap-2 text-sm font-medium text-right text-teal-600 dark:text-teal-400"
                    onClick={handleCopy}
                  >
                    <span className="truncate">{referralCoupon}</span>
                    <Copy className="w-4 h-4 cursor-pointer" />
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => { router.push('/about-us'); }}
              >
                About Us
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => { router.push('/dashboard'); }}     
              >
                Dashboard
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  signOut({
                    redirectTo: '/login',
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    {isPopupOpen && <PriceCalculatorPopup onClose={() => setIsPopupOpen(false)} />}
    {isSupportOpen && <CustomerSupportPopup onClose={() => setIsSupportOpen(false)} />}
</>
  );
}