import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserBalance } from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await getUserBalance(session.user.id);

    if (balance === null) {
      return NextResponse.json({ error: "Balance not found" }, { status: 404 });
    }

    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
