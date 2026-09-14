import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(USER_AUTH_COOKIE_NAME);

  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}

