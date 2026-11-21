import connectDB from "@/lib/mongodb";
import Contact from "@/model/Contact";
import Reply from "@/model/Reply";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { id, reply, status = "resolved", repliedBy = "MyStore Support Team" } = body;

    if (!id || !reply || !reply.trim()) {
      return Response.json(
        { success: false, message: "Inquiry ID and reply content are required" },
        { status: 400 }
      );
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        reply: reply.trim(),
        adminReply: reply.trim(),
        isReplied: true,
        repliedAt: new Date(),
        repliedBy: repliedBy,
        status: status,
      },
      { new: true }
    );

    if (!updatedContact) {
      return Response.json(
        { success: false, message: "Contact inquiry not found" },
        { status: 404 }
      );
    }

    try {
      await Reply.create({
        messageId: updatedContact._id,
        userId: updatedContact.userId || null,
        adminReply: reply.trim(),
      });
    } catch (err) {
      console.warn("Notice: Reply log creation optional error:", err.message);
    }

    return Response.json({
      success: true,
      message: "Reply sent successfully to user!",
      data: updatedContact,
    });
  } catch (error) {
    console.error("Error submitting admin reply:", error);
    return Response.json(
      { success: false, message: "Failed to send reply. Please try again." },
      { status: 500 }
    );
  }
}