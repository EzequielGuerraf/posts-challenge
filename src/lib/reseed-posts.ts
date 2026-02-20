import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

type UserJson = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
};

type PostJson = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function assertArray<T>(value: unknown, label: string): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
}

export async function reseedPostsDatabase() {
  const dataDir = path.join(process.cwd(), "seed-data");
  const usersPath = path.join(dataDir, "users.json");
  const postsPath = path.join(dataDir, "posts.json");

  const usersData = await readJsonFile<unknown>(usersPath);
  const postsData = await readJsonFile<unknown>(postsPath);

  assertArray<UserJson>(usersData, "users.json");
  assertArray<PostJson>(postsData, "posts.json");

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone ?? null,
        website: user.website ?? null,
      },
      create: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone ?? null,
        website: user.website ?? null,
      },
    });
  }

  for (const post of postsData) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        userId: post.userId,
        title: post.title,
        body: post.body,
      },
      create: {
        id: post.id,
        userId: post.userId,
        title: post.title,
        body: post.body,
      },
    });
  }

  const [userCount, postCount] = await prisma.$transaction([
    prisma.user.count(),
    prisma.post.count(),
  ]);

  return { userCount, postCount };
}
