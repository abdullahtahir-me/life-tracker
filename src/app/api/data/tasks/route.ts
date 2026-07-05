import { NextResponse } from "next/server";
import { getTasks } from "@/lib/services/tasks";
import { getProjects } from "@/lib/services/projects";
import { getDomains } from "@/lib/services/domains";

export async function GET() {
  const [tasks, projects, domains] = await Promise.all([getTasks(), getProjects(), getDomains()]);
  return NextResponse.json({ tasks, projects, domains });
}