export const APPOINTMENT_CONFIG = {
	// Online payment-এর জন্য slot কতক্ষণ আটকে থাকবে
	holdMinutes: 30,
	// Stripe-এর expires_at কমপক্ষে ৩০ মিনিট পরের হতে হয় (Stripe-এর নিজের সময় ধরে),
	// network-এর দেরির জন্য ১ মিনিট বেশি। Hold শেষে cron session নিজেই বন্ধ করে দেয়।
	stripeSessionMinutes: 31,
	// রোগী নিজে কত মিনিট আগে পর্যন্ত cancel করতে পারবে
	patientCancelBeforeMinutes: 120,
	currency: "usd",
	// Stripe-এ USD-র সর্বনিম্ন charge 50 cents
	minOnlineAmountCents: 50,
	// Appointment-এর কত মিনিট আগে থেকে check-in করা যায় (কালকের appointment আজ check-in যেন না হয়)
	checkInOpensMinutesBefore: 120,
	// শুরুর কত মিনিট পরেও না এলে no-show চিহ্নিত করা যায়
	noShowAfterMinutes: 30,
};
