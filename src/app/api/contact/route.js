import connectDB from "@/lib/mongodb";
import Contact from "@/model/Contact";

export const dynamic = "force-dynamic";

// GET user contact inquiries (excluding soft-deleted)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    const query = { isDeleted: { $ne: true } };
    if (userId) {
      query.userId = userId;
    } else if (email) {
      query.email = email.toLowerCase().trim();
    }

    const messages = await Contact.find(query).sort({ createdAt: -1 }).lean();

    return Response.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return Response.json(
      { success: false, message: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// POST new contact inquiry
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, name, email, phone, category, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json(
        { success: false, message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const newMsg = await Contact.create({
      userId: userId || null,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      category: category || "General Inquiry",
      subject: subject.trim(),
      message: message.trim(),
      status: "pending",
      isReplied: false,
      isDeleted: false,
    });

    return Response.json({
      success: true,
      message: "Your message has been sent to our support team!",
      data: newMsg,
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return Response.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}