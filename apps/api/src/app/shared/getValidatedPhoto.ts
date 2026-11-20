import { AppError } from "@/app/errorHelpers/AppError";
import type { Request } from "express";
import { fileTypeFromBuffer } from "file-type";
import httpStatus from "http-status";

// SVG ইচ্ছা করে বাদ: SVG-র ভেতরে <script> থাকতে পারে
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Client-এর mimetype বা extension-এ ভরসা না, file-এর প্রথম byte-গুলো (magic bytes) দেখে আসল type
export const getValidatedPhoto = async (req: Request): Promise<Buffer> => {
	if (!req.file) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Photo is required (form field "photo")');
	}

	const type = await fileTypeFromBuffer(req.file.buffer);
	if (!type || !ALLOWED_PHOTO_TYPES.has(type.mime)) {
		throw new AppError(httpStatus.BAD_REQUEST, "Only JPEG, PNG or WebP images are allowed");
	}

	return req.file.buffer;
};
