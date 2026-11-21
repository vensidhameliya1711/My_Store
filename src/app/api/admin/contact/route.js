import connectDB from "@/lib/mongodb";
import Contact from "@/model/Contact";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search");

    let filter = {};

    if (status === "trash" || status === "deleted") {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
      if (status === "pending") {
        filter.isReplied = false;
      } else if (status === "resolved") {
        filter.isReplied = true;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$and = [
        { ...filter },
        {
          $or: [
            { name: regex },
            { email: regex },
            { subject: regex },
            { message: regex },
            { category: regex },
          ],
        },
      ];
    }

    const messages = await Contact.find(filter).sort({ updatedAt: -1, createdAt: -1 }).lean();

    const totalActiveCount = await Contact.countDocuments({ isDeleted: { $ne: true } });
    const pendingCount = await Contact.countDocuments({ isDeleted: { $ne: true }, isReplied: false });
    const resolvedCount = await Contact.countDocuments({ isDeleted: { $ne: true }, isReplied: true });
    const trashCount = await Contact.countDocuments({ isDeleted: true });

    return Response.json({
      success: true,
      data: messages,
      counts: {
        total: totalActiveCount,
        pending: pendingCount,
        resolved: resolvedCount,
        trash: trashCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin contact messages:", error);
    return Response.json(
      { success: false, message: "Failed to fetch contact inquiries", data: [] },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let permanent = searchParams.get("permanent") === "true";

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
        if (body.permanent !== undefined) {
          permanent = Boolean(body.permanent);
        }
      } catch (_) { }
    }

    if (!id) {
      return Response.json(
        { success: false, message: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    if (permanent) {
      const deleted = await Contact.findByIdAndDelete(id);
      return Response.json({
        success: true,
        message: "Inquiry permanently deleted",
        data: deleted,
      });
    } else {
      const updated = await Contact.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        },
        { new: true }
      );

      return Response.json({
        success: true,
        message: "Inquiry moved to Trash (Soft Deleted)",
        data: updated,
      });
    }
  } catch (error) {
    console.error("Error deleting contact inquiry:", error);
    return Response.json(
      { success: false, message: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    let id = null;
    let action = "restore";

    try {
      const body = await req.json();
      id = body.id;
      if (body.action) action = body.action;
    } catch (_) { }

    if (!id) {
      const { searchParams } = new URL(req.url);
      id = searchParams.get("id");
      if (searchParams.get("action")) action = searchParams.get("action");
    }

    if (!id) {
      return Response.json(
        { success: false, message: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    if (action === "restore") {
      const restored = await Contact.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
          },
        },
        { new: true }
      );

      if (!restored) {
        return Response.json(
          { success: false, message: "Inquiry not found" },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Inquiry restored successfully!",
        data: restored,
      });
    }

    return Response.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error restoring contact inquiry:", error);
    return Response.json(
      { success: false, message: "Failed to restore inquiry" },
      { status: 500 }
    );
  }
}