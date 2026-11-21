import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export async function NavbarAuth() {
	const user = null;

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

	return null;
}

export function NavbarAuthSkeleton() {
	return <Skeleton className="hidden h-10 w-20 rounded-md md:block" />;
}
