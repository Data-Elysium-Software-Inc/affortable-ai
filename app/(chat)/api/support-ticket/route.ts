import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/lib/db/queries";
import { sendSupportTicketEmail } from "@/lib/mailer/email";

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse the incoming JSON request containing the support ticket details
    const { issue, description } = await request.json();
    
    // Retrieve the user details from the database
    const user = await getUserById(session.user.id);
    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found or email missing" }, { status: 404 });
    }
    
    // Generate a random 10-digit ticket ID
    const ticketId = Math.floor(Math.random() * 9000000000) + 1000000000;
    
    // Append the ticket ID to the issue for the email subject
    const modifiedIssue = `${issue} [Ticket ID: ${ticketId}]`;
    
    // Send the support ticket email using the user's email as the sender (via replyTo)
    await sendSupportTicketEmail(user.email, modifiedIssue, description);
    
    return NextResponse.json({ message: "Ticket submitted successfully" });
  } catch (error) {
    console.error("Error submitting support ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
