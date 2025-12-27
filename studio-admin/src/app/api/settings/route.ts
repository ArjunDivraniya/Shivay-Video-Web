import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  await dbConnect();
  const settings = await Setting.findOne().lean();
  return NextResponse.json(settings || {});
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = settingsSchema.parse(data);

    await dbConnect();
    const settings = await Setting.findOneAndUpdate({}, parsed, {
      upsert: true,
      new: true,
    });
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 400 });
  }
}
