import { NextResponse } from "next/server";
import { getReferralCouponByEmail } from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    // Parse the query parameter from the request URL
    const url = new URL(request.url);
    console.log(url)
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get referral coupon using the email parameter
    const referralCoupon = await getReferralCouponByEmail(email);

    if (referralCoupon === null) {
      return NextResponse.json({ error: "Referral coupon not found" }, { status: 404 });
    }

    // Return the referral coupon
    return NextResponse.json({ referralCoupon });
  } catch (error) {
    console.error("Error fetching referral coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
