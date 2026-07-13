// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  fileUri: string,
  folder: string = "platform_uploads",
) {
  try {
    const response = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
      resource_type: "auto",
    });
    return {
      url: response.secure_url,
      publicId: response.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image asset");
  }
}

export default cloudinary;
