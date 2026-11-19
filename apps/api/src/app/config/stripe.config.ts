import { Stripe } from "stripe";
import { envVars } from "./env";

// apiVersion না দিলে SDK যে version-এর জন্য বানানো সেটাই ব্যবহার হয় (types-এর সাথে মেলে)
export const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);
