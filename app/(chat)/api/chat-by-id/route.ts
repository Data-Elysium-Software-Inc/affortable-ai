import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatById, deleteChatById, getMessagesByChatId } from "@/lib/db/queries";

// GET /api/chat-by-id?id=...
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the query parameter `id`
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");
    if (!chatId) {
      return NextResponse.json(
        { error: "Missing `id` query parameter" },
        { status: 400 }
      );
    }

    // 1) Fetch the chat
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2) Fetch the messages for that chat
    const messages = await getMessagesByChatId({ id: chatId });

    // 3) Return both chat and messages in one response
    return NextResponse.json(
      {
        chat,
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chat by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat-by-id?id=...
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the query parameter `id`
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing `id` query parameter" },
        { status: 400 }
      );
    }

    // 2. Verify the chat exists and belongs to the user
    const chat = await getChatById({ id });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Delete the chat
    await deleteChatById({ id });
    return NextResponse.json({ message: "Chat deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
