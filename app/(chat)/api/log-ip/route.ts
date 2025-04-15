import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { logIpAddress } from "../../actions";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ip } = await request.json();

    await logIpAddress(session.user.id, ip);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error logging IP address:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
