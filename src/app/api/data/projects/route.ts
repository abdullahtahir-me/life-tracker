import { NextResponse } from "next/server";
import { getProjectsWithStats } from "@/lib/services/projects";
import { getDomains } from "@/lib/services/domains";

export async function GET() {
  const [projects, domains] = await Promise.all([getProjectsWithStats(), getDomains()]);
  return NextResponse.json({ projects, domains });
}