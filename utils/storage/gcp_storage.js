const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const {
  ValidationError
} = require("../helper/response");
const cloudinary = require("cloudinary").v2;

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fungsi untuk upload ke Cloudinary
const uploadFileToCloudinary = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();

    if (![".jpeg", ".jpg", ".png"].includes(ext)) {
      throw new ValidationError("File bukan file gambar (jpeg/png)");
    }

    const folderName = process.env.FOLDER_NAME || "uploads";

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      public_id: uuidv4(),
      resource_type: "image",
    });

    return result.secure_url;
  } catch (err) {
    console.error("Error saat mengunggah ke Cloudinary:", err);
    throw err;
  }
};

module.exports = {
  uploadFileToCloudinary,
};
