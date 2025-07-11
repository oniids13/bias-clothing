import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const gallery = [
  "https://res.cloudinary.com/dli2wmthu/image/upload/v1752215037/g4_nbwfkq.jpg",
  "https://res.cloudinary.com/dli2wmthu/image/upload/v1752215037/g3_cdzx7x.jpg",
  "https://res.cloudinary.com/dli2wmthu/image/upload/v1752215036/g2_um7wpy.jpg",
  "https://res.cloudinary.com/dli2wmthu/image/upload/v1752215036/g1_lz23sh.jpg",
];

async function seedGallery() {
  console.log("🌱 Starting gallery seeding...");
  try {
    await prisma.gallery.deleteMany({});

    for (const imageUrl of gallery) {
      await prisma.gallery.create({
        data: {
          imageUrl,
        },
      });
    }
    console.log("✅ Gallery seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding gallery:", error);
    throw error;
  }
}

seedGallery().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
