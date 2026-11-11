export class AppError extends Error {
	public readonly statusCode: number;

	constructor(statusCode: number, message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "AppError";
		this.statusCode = statusCode;
	}
}
