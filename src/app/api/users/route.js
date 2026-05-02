import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const users = await User.find({}).select("-password");
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}