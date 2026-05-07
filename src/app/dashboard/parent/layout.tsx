'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/parent', icon: '📊' },
    { name: 'Student', href: '/dashboard/parent/children', icon: '👧👦' },
    { name: 'Announcements', href: '/dashboard/parent/announcements', icon: '📢' },
    { name: 'Grades', href: '/dashboard/parent/grades', icon: '📝' },
    { name: 'Profile', href: '/dashboard/parent/profile', icon: '👤' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Parent Portal</h1>
          <p className="text-sm text-gray-500">Monitoring Dashboard</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}