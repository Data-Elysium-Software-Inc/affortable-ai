// chat/api/coupon/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { findCouponByCode, redeemCoupon } from "@/lib/db/queries";

// Define the schema for the request body using zod
const CouponCodeSchema = z.object({
  code: z.string().nonempty("Coupon code is required"),
});

// GET method to retrieve coupon details
export async function GET(request: Request) {
  try {
    // Parse the query parameter from the request URL
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Get coupon details using the code parameter
    const coupon = await findCouponByCode(code);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Return the coupon details
    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST method to redeem a coupon
export async function POST(request: Request) {
  try {
    // Authenticate the user using your auth function
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate the request body
    const body = await request.json();
    const parsedBody = CouponCodeSchema.safeParse(body);

    if (!parsedBody.success) {
      const errorMessage = parsedBody.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { code } = parsedBody.data;

    // Redeem the coupon for the user
    const result = await redeemCoupon(userId, code);

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Error redeeming coupon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}