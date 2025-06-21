const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const {
  ValidationError
} = require("../helper/response")
const cloudinary = require("cloudinary").v2;

// Dekode string base64
const base64EncodedKey = process.env.GOOGLE_CLOUD_KEY_BASE64;
const serviceKey = Buffer.from(base64EncodedKey, "base64").toString("utf8");

// Parse JSON key
const serviceKeyJson = JSON.parse(serviceKey);

// Buat klien Google Cloud Storage
const storage = new Storage({
  credentials: serviceKeyJson,
  projectId: serviceKeyJson.project_id,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Referensi bucket Anda
const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

// Fungsi untuk mengunggah file ke GCS
const uploadFileToGCS = async (filePath) => {
  try {
    // Generate UUID for the file
    const newFileName = uuidv4();
    const ext = path.extname(filePath).toLowerCase();

    let typeFile;
    if (ext === ".jpeg" || ext === ".jpg") {
      typeFile = "image/jpeg";
    } else if (ext === ".png") {
      typeFile = "image/png";
    } else {
      throw new Error("File bukan file gambar (jpeg/png)");
    }

    // Set destination path with new file name and original extension
    const folderName = process.env.FOLDER_NAME;
    const destination = `${folderName}/${newFileName}${ext}`;

    await bucket.upload(filePath, {
      destination: destination,
      resumable: false,
      public: true,
      metadata: {
        contentType: typeFile,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    return publicUrl;
  } catch (err) {
    console.error("Error saat mengunggah file:", err);
    throw err;
  }
};

const uploadFileToGCSForArticle = async (filePath) => {
  try {
    // Generate UUID for the file
    const newFileName = uuidv4();
    const ext = path.extname(filePath).toLowerCase();

    let typeFile;
    if (ext === ".jpeg" || ext === ".jpg") {
      typeFile = "image/jpeg";
    } else if (ext === ".png") {
      typeFile = "image/png";
    } else {
      throw new Error("File bukan file gambar (jpeg/png)");
    }

    // Set destination path with new file name and original extension
    const folderName = "article";
    const destination = `${folderName}/${newFileName}${ext}`;

    await bucket.upload(filePath, {
      destination: destination,
      resumable: false,
      public: true,
      metadata: {
        contentType: typeFile,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    return publicUrl;
  } catch (err) {
    console.error("Error saat mengunggah file:", err);
    throw err;
  }
};

const uploadPDFForJob = async (filePath) => {
  try {
    // Generate UUID for the file
    const newFileName = uuidv4();
    const ext = path.extname(filePath).toLowerCase();

    if (ext !== ".pdf") {
      throw new ValidationError("File bukan file pdf");
    }

    // Set destination path with new file name and original extension
    const folderName = "job";
    const destination = `${folderName}/${newFileName}${ext}`;

    await bucket.upload(filePath, {
      destination: destination,
      resumable: false,
      public: true,
      metadata: {
        contentType: "application/pdf",
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    return publicUrl;
  } catch (err) {
    console.error("Error saat mengunggah file:", err);
    throw err;
  }
};

const uploadFileToCloudinary = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();

    if (![".jpeg", ".jpg", ".png"].includes(ext)) {
      throw new ValidationError("File bukan file gambar (jpeg/png)");
    }

    const folderName = process.env.FOLDER_NAME || "uploads"; // fallback jika tidak ada

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
  uploadFileToGCS,
  uploadFileToGCSForArticle,
  uploadPDFForJob,
  uploadFileToCloudinary,
};
