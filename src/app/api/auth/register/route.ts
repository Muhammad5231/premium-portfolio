import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { hashPassword, createSessionToken, USER_AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, username } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    let cleanUsername = username ? username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "") : "";
    if (cleanUsername) {
      const existingUsername = await User.findOne({ username: cleanUsername });
      if (existingUsername) {
        return NextResponse.json(
          { error: "This username is already taken." },
          { status: 409 }
        );
      }
    } else {
      // Auto-generate username from email prefix
      const prefix = normalizedEmail.split("@")[0].replace(/[^a-z0-9_]/g, "");
      cleanUsername = `${prefix}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: normalizedEmail,
      passwordHash,
      status: "active",
      notificationPreferences: {
        emailNotifications: true,
        commentReplies: true,
        adminMessages: true,
      },
    });

    // Create default welcome notification
    await Notification.create({
      recipientId: newUser._id,
      recipientRole: "user",
      type: "SYSTEM",
      title: "Welcome to the Atelier // Studio Community",
      message: "Your account is verified and active. You can now contribute to editorial discussions and dispatch direct commission briefs.",
      link: "/blog",
    });

    // Sign session token
    const sessionToken = await createSessionToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: "user",
      username: newUser.username,
    });

    const cookieStore = cookies();
    cookieStore.set(USER_AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          avatarUrl: newUser.avatarUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during registration." },
      { status: 500 }
    );
  }
}

