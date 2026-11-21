import connectDB from "@/lib/mongodb";
import Contact from "@/model/Contact";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, email } = await req.json();

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
    console.error("Error fetching user contact messages:", error);
    return Response.json({ success: false, data: [] }, { status: 500 });
  }
}

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
    console.error("Error fetching user contact messages:", error);
    return Response.json({ success: false, data: [] }, { status: 500 });
  }
}