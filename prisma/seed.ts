import { prisma } from "../src/lib/prisma";
import { readFile } from "node:fs/promises";
import path from "node:path";

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

async function main() {
  const dataDir = path.join(process.cwd(), "seed-data");
  const usersPath = path.join(dataDir, "users.json");
  const postsPath = path.join(dataDir, "posts.json");

  const usersData = await readJsonFile<unknown>(usersPath);
  const postsData = await readJsonFile<unknown>(postsPath);

  assertArray<UserJson>(usersData, "users.json");
  assertArray<PostJson>(postsData, "posts.json");

  // Seed users first (posts reference userId).
  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone ?? null,
        website: u.website ?? null,
      },
      create: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone ?? null,
        website: u.website ?? null,
      },
    });
  }

  // Then seed posts
  for (const p of postsData) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {
        userId: p.userId,
        title: p.title,
        body: p.body,
      },
      create: {
        id: p.id,
        userId: p.userId,
        title: p.title,
        body: p.body,
      },
    });
  }

  const [userCount, postCount] = await prisma.$transaction([
    prisma.user.count(),
    prisma.post.count(),
  ]);

  console.log(`Seed completed. Users: ${userCount}, Posts: ${postCount}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
