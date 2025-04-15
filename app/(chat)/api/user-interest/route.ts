import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { insertUserInterest } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    // 1) Validate session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse the request body
    const { modelId } = await request.json() as { modelId?: string };
    if (!modelId) {
      return NextResponse.json(
        { error: "modelId is required" },
        { status: 400 }
      );
    }

    // 3) Insert usage log
    await insertUserInterest(session.user.id, modelId);

    // 4) Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging model usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
