import { NextResponse } from "next/server";
import { getNetwork } from "@/lib/services/people";

export async function GET() {
  const data = await getNetwork();
  return NextResponse.json(data);
}