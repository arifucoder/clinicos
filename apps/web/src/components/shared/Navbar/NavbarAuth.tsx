import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomeForRole } from "@/lib/authRedirect";
import { AUTH_COOKIES } from "@/lib/cookieConfig";
import { getCurrentUser } from "@/lib/currentUser";
import { type ShellUser, toShellUser } from "@/lib/userDisplay";
import { cookies } from "next/headers";
import Link from "next/link";
import { MobileNav } from "./MobileNav";

// public page-এর জন্য: user না পেলে null, কখনো throw করে না
const getNavbarUser = async (): Promise<ShellUser | null> => {
	// cookie-ই নেই → নিশ্চিত logged out, api-তে অকারণ request পাঠাই না
	// (proxy আগেই refresh করে রাখে, তাই refresh token থাকলে এখানে নতুন accessToken পাব)
	const cookieStore = await cookies();
	if (!cookieStore.has(AUTH_COOKIES.accessToken)) return null;

	try {
		const me = await getCurrentUser(); // cache(): desktop আর mobile দুজনে ডাকলেও api call একবার
		return me ? toShellUser(me) : null;
	} catch {
		// api down: পুরো home page error.tsx-এ না পাঠিয়ে শুধু "Log in" দেখাই
		return null;
	}
};

export async function NavbarAuth() {
	const user = await getNavbarUser();

	if (!user) {
		return (
			<Button
				render={<Link href="/login" />}
				nativeButton={false}
				variant="ghost"
				size="lg"
				className="hidden font-semibold text-foreground md:inline-flex"
			>
				Log in
			</Button>
		);
	}

	return <UserMenu user={user} showDashboardLink />;
}

export function NavbarAuthSkeleton() {
	return <Skeleton className="hidden h-10 w-20 rounded-md md:block" />;
}

// mobile sheet-এর জন্য একই user; logged in হলে "Log in"-এর বদলে dashboard link
export async function MobileNavAuth() {
	const user = await getNavbarUser();
	return <MobileNav dashboardHref={user ? getHomeForRole(user.role) : undefined} />;
}
