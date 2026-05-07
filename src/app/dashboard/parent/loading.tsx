export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-10 shadow-lg shadow-slate-900/5">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="text-sm font-medium text-slate-600">Loading parent dashboard...</p>
      </div>
    </div>
  );
}
