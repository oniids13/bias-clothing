import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_KEY ||
  !process.env.CLOUDINARY_SECRET
) {
  throw new Error("Missing Cloudinary configuration in environment variables");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `bias_clothing/tshirts`,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      resource_type: "auto",
      quality: "auto:good",
    });

    console.log("Upload successful:", result.public_id);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

export { uploadImage, cloudinary };
