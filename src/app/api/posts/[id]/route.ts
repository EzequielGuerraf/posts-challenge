import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  try {
    const id = Number(idParam);

    // Validate id param
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid id. It must be a positive integer." },
        { status: 400 }
      );
    }

    // Avoid relying on Prisma error codes: check first for a clean 404
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(`DELETE /api/posts/${idParam} failed:`, err);
    return NextResponse.json(
      { error: "Couldn’t delete the post. Please try again." },
      { status: 500 }
    );
  }
}
