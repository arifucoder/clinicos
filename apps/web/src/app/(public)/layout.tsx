export default function PublicLayout({ children }: LayoutProps<"/">) {
	return (
		<>
			<main className="flex-1">{children}</main>
		</>
	);
}
