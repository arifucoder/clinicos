import { StatusPill } from "@/components/shared/StatusPill";

interface StaffStatusProps {
	isActive: boolean;
	needPasswordChange: boolean;
	isPaused?: boolean;
}

export function StaffStatus({ isActive, needPasswordChange, isPaused }: StaffStatusProps) {
	return (
		<div className="flex flex-wrap gap-1.5">
			<StatusPill tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</StatusPill>
			{needPasswordChange && <StatusPill tone="info">Invited</StatusPill>}
			{isPaused && <StatusPill tone="warning">Paused</StatusPill>}
		</div>
	);
}
