import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    let userId: number | undefined;

    if (userIdParam !== null) {
      const parsed = Number(userIdParam);

      // Validate userId query param
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return NextResponse.json(
          { error: "Invalid userId. It must be a positive integer." },
          { status: 400 }
        );
      }

      userId = parsed;
    }

    const posts = await prisma.post.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { id: "asc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts failed:", err);
    return NextResponse.json(
      { error: "Couldn’t load posts. Please try again." },
      { status: 500 }
    );
  }
}