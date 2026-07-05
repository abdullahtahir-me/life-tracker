import { NextResponse } from "next/server";
import { getDomains } from "@/lib/services/domains";

export async function GET() {
  try {
    // We just call the service we already wrote!
    const domains = await getDomains();
    return NextResponse.json(domains, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}