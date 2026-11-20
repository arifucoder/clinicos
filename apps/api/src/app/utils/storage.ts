import { envVars } from "@/app/config/env";
import { AppError } from "@/app/errorHelpers/AppError";
import { v2 as cloudinary } from "cloudinary";
import httpStatus from "http-status";
import { randomUUID } from "node:crypto";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = envVars;

export const isStorageConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (isStorageConfigured) {
	cloudinary.config({
		cloud_name: CLOUDINARY_CLOUD_NAME,
		api_key: CLOUDINARY_API_KEY,
		api_secret: CLOUDINARY_API_SECRET,
		secure: true,
	});
}

const assertStorageConfigured = () => {
	if (!isStorageConfigured) {
		throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "Photo upload is not configured");
	}
};

export type TUploadedImage = { url: string; publicId: string };

export const uploadImage = (buffer: Buffer, folder: string): Promise<TUploadedImage> => {
	assertStorageConfigured();

	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder, public_id: randomUUID(), resource_type: "image", overwrite: false },
			(error, result) => {
				if (error || !result) {
					console.error("Cloudinary upload failed", error);
					reject(new AppError(httpStatus.BAD_GATEWAY, "Photo upload failed, please try again"));
					return;
				}
				resolve({ url: result.secure_url, publicId: result.public_id });
			},
		);
		stream.end(buffer);
	});
};

export const deleteImage = async (publicId: string): Promise<void> => {
	assertStorageConfigured();
	await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
};

export const deleteImageQuietly = async (publicId: string | null): Promise<void> => {
	if (!publicId) return;
	try {
		await deleteImage(publicId);
	} catch (error) {
		console.error(`Failed to delete image ${publicId}`, error);
	}
};
