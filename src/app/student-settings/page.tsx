export default function StudentSettingsPage() {
return (
<main className="min-h-screen bg-slate-100 p-8">
<h1 className="text-3xl font-bold">Settings</h1>
<p className="mt-2 text-slate-600">
Manage your profile, notifications, and security.
</p>

<div className="mt-6 space-y-6">
<div className="rounded-xl bg-white p-6 shadow">
<h2 className="text-xl font-semibold">Profile Information</h2>
<p className="text-sm text-slate-500">
Update your name, email, and personal details.
</p>
</div>

<div className="rounded-xl bg-white p-6 shadow">
<h2 className="text-xl font-semibold">Notification Preferences</h2>
<p className="text-sm text-slate-500">
Choose how you receive announcements and updates.
</p>
</div>

<div className="rounded-xl bg-white p-6 shadow">
<h2 className="text-xl font-semibold">Account Security</h2>
<p className="text-sm text-slate-500">
Manage password and account protection.
</p>
</div>

<div className="rounded-xl bg-white p-6 shadow">
<h2 className="text-xl font-semibold">Support</h2>
<p className="text-sm text-slate-500">
Contact support or get help.
</p>
</div>
</div>
</main>
);
}
