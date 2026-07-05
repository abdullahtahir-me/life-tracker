import { NextResponse } from "next/server";
import { getFinanceData } from "@/lib/services/finances";

export async function GET() {
  const data = await getFinanceData();
  return NextResponse.json(data);
}