import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, type ShellUser } from "@/lib/userDisplay";

export function UserAvatar({ user, className }: { user: Pick<ShellUser, "name" | "image">; className?: string }) {
	return (
		<Avatar className={className}>
			{user.image && <AvatarImage src={user.image} alt="" />}
			<AvatarFallback className="bg-violet-50 text-xs font-semibold text-violet-700">
				{getInitials(user.name)}
			</AvatarFallback>
		</Avatar>
	);
}
