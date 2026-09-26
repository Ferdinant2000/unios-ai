import { NextResponse } from "next/server";
import { COURSES } from "@/lib/mock-hemis";

export async function GET() {
  return NextResponse.json({ courses: COURSES });
}