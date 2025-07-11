import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getGallery = async () => {
  try {
    const gallery = await prisma.gallery.findMany();
    return gallery;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    throw error;
  }
};

export { getGallery };
