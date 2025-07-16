import { PrismaClient } from "@prisma/client";
import { createSlug } from "../utils/slugify.js";

const prisma = new PrismaClient();

const products = [
  {
    name: "Bias T-shirt Black",
    description:
      "High-quality 100% cotton t-shirt with a comfortable fit. Perfect for casual wear.",
    imageUrl: [
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752214789/bias_shop_2a_mi3hyu.png",
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752215000/bias-black-closeup_gesxac.png",
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752214789/bias_shop_2b_q0fw3o.png",
    ],
    price: 500,
    category: "T-Shirts",
    isFeatured: true,
    isNew: true,
    variants: [
      { size: "XS", color: "Black", stock: 25 },
      { size: "S", color: "Black", stock: 30 },
      { size: "M", color: "Black", stock: 20 },
      { size: "L", color: "Black", stock: 15 },
      { size: "XL", color: "Black", stock: 20 },
      { size: "XXL", color: "Black", stock: 25 },
      { size: "XXXL", color: "Black", stock: 18 },
    ],
    details: [
      "100% Cotton",
      "Comfortable fit",
      "Machine washable",
      "Made in PH",
    ],
  },
  {
    name: "Bias T-shirt White",
    description:
      "High-quality 100% cotton t-shirt with a comfortable fit. Perfect for casual wear.",
    imageUrl: [
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752214794/shop_3_lg4lfs.png",
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752214795/shop_2_idm1nm.png",
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752214794/shop_1_vilnrv.png",
    ],
    price: 450,
    category: "T-Shirts",
    isFeatured: true,
    isNew: true,
    variants: [
      { size: "XS", color: "White", stock: 15 },
      { size: "S", color: "White", stock: 20 },
      { size: "M", color: "White", stock: 18 },
      { size: "L", color: "White", stock: 10 },
      { size: "XL", color: "White", stock: 12 },
      { size: "XXL", color: "White", stock: 15 },
      { size: "XXXL", color: "White", stock: 14 },
    ],
    details: [
      "100% Cotton",
      "Cotton shirt with a relaxed fit",
      "Machine washable",
      "Made in PH",
    ],
  },
  {
    name: "Bias Shirt Sunrise",
    description: "Cotton shirt with a relaxed fit. Perfect for casual wear.",
    imageUrl: [
      "https://res.cloudinary.com/dli2wmthu/image/upload/v1752214790/sample_shirt_cltwzb.png",
    ],
    price: 550,
    category: "T-Shirts",
    isFeatured: true,
    isNew: true,
    variants: [
      { size: "XS", color: "Skyblue", stock: 15 },
      { size: "S", color: "Skyblue", stock: 20 },
      { size: "M", color: "Skyblue", stock: 18 },
      { size: "L", color: "Skyblue", stock: 10 },
      { size: "XL", color: "Skyblue", stock: 12 },
      { size: "XXL", color: "Skyblue", stock: 15 },
      { size: "XXXL", color: "Skyblue", stock: 14 },
    ],
    details: [
      "100% Cotton",
      "Silkscreen printed design",
      "Machine washable",
      "Made in PH",
    ],
  },
];

// Generate SKU based on product name, size, and color
const generateSKU = (productName, size, color) => {
  const productCode = productName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 4);
  const colorCode = color.replace(/\s+/g, "").substring(0, 3).toUpperCase();
  return `${productCode}-${size}-${colorCode}`;
};

async function seedProducts() {
  console.log("🌱 Starting product seeding...");

  try {
    // Clear existing products and variants
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    console.log("🧹 Cleared existing products and variants");

    for (const productData of products) {
      const { variants, ...productInfo } = productData;

      // Create slug using the slugify utility
      const slug = createSlug(productInfo.name);

      // Create the product
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          slug,
        },
      });

      console.log(
        `✅ Created product: ${product.name} (slug: ${product.slug})`
      );

      // Create variants for the product
      for (const variantData of variants) {
        const sku = generateSKU(
          product.name,
          variantData.size,
          variantData.color
        );

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: variantData.size,
            color: variantData.color,
            stock: variantData.stock,
            sku,
          },
        });
      }

      console.log(
        `  📦 Created ${variants.length} variants for ${product.name}`
      );
    }

    // Display summary
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.productVariant.count();

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`  • Products created: ${totalProducts}`);
    console.log(`  • Variants created: ${totalVariants}`);
    console.log(
      `  • Featured products: ${products.filter((p) => p.isFeatured).length}`
    );
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedProducts().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
