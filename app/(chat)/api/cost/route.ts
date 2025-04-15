import { NextResponse } from "next/server";
import { getMessageById } from "@/lib/db/queries";

export async function GET(req: Request) {
  
    try {
      const { searchParams } = new URL(req.url);
      const messageId = searchParams.get("messageId"); // Extract parameter
  
      if (!messageId) {
        return NextResponse.json({ error: "messageId is required" }, { status: 400 });
      }

      const message = await getMessageById({ id: messageId });
      // Handle case where no message is found
      if (!message || message.length === 0) {
        console.log("big error")
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message });
      //return NextResponse.json({ name:"hello world"});
    } catch (error) {
      console.error("Error fetching user balance:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }