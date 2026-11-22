import { AUTH_COOKIES } from "@/lib/cookieConfig";
import { type NextRequest, NextResponse } from "next/server";

// Server Component cookie মুছতে পারে না, তাই এই Route Handler দিয়ে মুছে /login-এ পাঠাই
export function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/login", request.url));
	for (const name of Object.values(AUTH_COOKIES)) response.cookies.delete(name);
	return response;
}
