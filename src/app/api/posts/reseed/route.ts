import { NextResponse } from "next/server";
import { reseedPostsDatabase } from "@/lib/reseed-posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const { userCount, postCount } = await reseedPostsDatabase();
    return NextResponse.json({ ok: true, userCount, postCount }, { status: 200 });
  } catch (err) {
    console.error("POST /api/posts/reseed failed:", err);
    return NextResponse.json(
      { error: "Couldn't re-seed posts. Please try again." },
      { status: 500 }
    );
  }
}
