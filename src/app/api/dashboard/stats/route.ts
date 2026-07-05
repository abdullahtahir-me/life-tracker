import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/services/dashboard";

export async function GET() {
  try {
    const stats = await getDashboardMetrics();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}