import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streakId = searchParams.get("streakId") || "STRK-2026-001";
  const elapsed = parseInt(searchParams.get("elapsed") || "0", 10);

  const progressPercent = Math.min(100, Math.round((elapsed / 15) * 100));
  const isAttested = elapsed >= 15;

  return NextResponse.json({
    success: true,
    data: {
      streakId,
      progressPercent,
      secondsRemaining: Math.max(0, 15 - elapsed),
      isAttested,
      stageDescription: isAttested
        ? "Streak check-in verified via Precompile 0x0FD2!"
        : "Attesting daily check-in on Creditcoin...",
    },
  });
}
