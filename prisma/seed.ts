import { prisma } from "../src/lib/prisma";
import { reseedPostsDatabase } from "../src/lib/reseed-posts";

async function main() {
  const { userCount, postCount } = await reseedPostsDatabase();

  console.log(`Seed completed. Users: ${userCount}, Posts: ${postCount}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
