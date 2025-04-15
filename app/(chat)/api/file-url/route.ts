import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload file using `put` from Vercel Blob SDK
    const blob = await put(file.name, file, {
      contentType: file.type,
      access: "public", // Set access to "public" or "private" as needed
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading file", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
