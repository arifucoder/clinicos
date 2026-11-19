import { envVars } from "@/app/config/env";
import { stripe } from "@/app/config/stripe.config";
import { AppError } from "@/app/errorHelpers/AppError";
import { catchAsync } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import type { Stripe } from "stripe";
import { PaymentService } from "./payment.service";

const handleStripeWebhook = catchAsync(async (req, res) => {
	const signature = req.headers["stripe-signature"];
	if (typeof signature !== "string") {
		throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe signature");
	}

	let event: Stripe.Event;
	try {
		// req.body এখানে Buffer (express.raw) — JSON parse হয়ে গেলে signature মিলবে না
		event = stripe.webhooks.constructEvent(req.body, signature, envVars.STRIPE_WEBHOOK_SECRET);
	} catch (error) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid Stripe signature", { cause: error });
	}

	// এখানে error হলে globalErrorHandler 500 দেয় → Stripe পরে আবার পাঠায়
	const result = await PaymentService.handleStripeEvent(event);

	sendResponse(res, { statusCode: httpStatus.OK, message: result.message, data: null });
});

export const PaymentController = {
	handleStripeWebhook,
};
