import multer from "multer";

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

// Memory-তে রাখে (disk-এ না) → আগে যাচাই, তারপর Cloudinary
export const uploadPhoto = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: PHOTO_MAX_BYTES, files: 1 },
}).single("photo");
