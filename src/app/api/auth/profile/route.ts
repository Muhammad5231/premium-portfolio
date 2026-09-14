import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      username,
      bio,
      avatarUrl,
      notificationPreferences,
      currentPassword,
      newPassword,
    } = body;

    await connectToDatabase();
    const user = await User.findById(session.id);
    if (!user || user.status === "suspended") {
      return NextResponse.json(
        { error: "User account not found or suspended." },
        { status: 404 }
      );
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (username && username.trim() !== user.username) {
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
      const existing = await User.findOne({
        username: cleanUsername,
        _id: { $ne: user._id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Username is already taken by another member." },
          { status: 409 }
        );
      }
      user.username = cleanUsername;
    }

    if (bio !== undefined) {
      user.bio = bio.slice(0, 500);
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    // Password change request
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters." },
          { status: 400 }
        );
      }

      user.passwordHash = await hashPassword(newPassword);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error updating profile." },
      { status: 500 }
    );
  }
}

