import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import s3Client from "../utils/s3Client.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// دالة رفع ملف واحد
const uploadToS3 = async (file) => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: `orders/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  const result = await upload.done();
  return result.Location; // رابط الصورة
};

// ميدلوير مخصص لرفع عدة صور وحقن روابطها في req.imageLinks
const uploadImagesMiddleware = [
  upload.array("images"), // قراءة الملفات فقط
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        req.imageLinks = [];
        return next();
      }

      const uploadPromises = req.files.map(uploadToS3);
      const imageLinks = await Promise.all(uploadPromises);

      req.imageLinks = imageLinks;
      next();
    } catch (err) {
      console.error("S3 upload error:", err);
      res.status(500).json({ message: "Image upload failed", error: err });
    }
  },
];

export { uploadImagesMiddleware };
