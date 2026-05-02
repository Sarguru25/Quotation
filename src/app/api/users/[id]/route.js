import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const updateData = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (body.managerId !== undefined) updateData.managerId = body.managerId;
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await User.findByIdAndUpdate(params.id, updateData, {
      new: true,
      select: "-password",
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}