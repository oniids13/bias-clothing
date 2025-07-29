import { v2 as cloudinary } from "cloudinary";
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

const uploadImage = async (input, folder = "bias_clothing/tshirts") => {
  try {
    let uploadOptions = {
      folder: folder,
      use_filename: true,
      unique_filename: true, // This will ensure unique filenames
      overwrite: false,
      resource_type: "auto",
      quality: "auto:good",
    };

    let result;

    // Handle buffer input (from multer)
    if (Buffer.isBuffer(input)) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(input);
      });
    } else {
      // Handle file path input (original functionality)
      result = await cloudinary.uploader.upload(input, uploadOptions);
    }

    console.log("Upload successful:", result.public_id);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Image deletion result for ${publicId}:`, result);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete image: ${publicId}`);
  }
};

const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    const results = await Promise.allSettled(deletePromises);

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = results.filter(
      (result) => result.status === "rejected"
    ).length;

    console.log(
      `Bulk delete results: ${successful} successful, ${failed} failed`
    );

    return {
      successful,
      failed,
      results,
    };
  } catch (error) {
    console.error("Bulk delete error:", error);
    throw new Error("Failed to delete multiple images");
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    // Extract public ID from URL like: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/filename.ext
    const regex = /\/upload\/v\d+\/(.+?)(?:\.[^.]*)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting public ID from URL:", url, error);
    return null;
  }
};

export {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
  getPublicIdFromUrl,
  cloudinary,
};
