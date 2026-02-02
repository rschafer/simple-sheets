import { NextRequest, NextResponse } from "next/server";

// In-memory store for MVP (would be replaced by a database)
let dashboardData: Record<string, unknown> | null = null;

export async function GET() {
  if (!dashboardData) {
    return NextResponse.json({ data: null }, { status: 404 });
  }
  return NextResponse.json({ data: dashboardData });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    dashboardData = body;
    return NextResponse.json({ data: dashboardData, savedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE() {
  dashboardData = null;
  return NextResponse.json({ success: true });
}
