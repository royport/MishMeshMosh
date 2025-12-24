'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavProps {
  userRole: string;
}

export function AdminNav({ userRole }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/campaigns', label: 'Campaigns', icon: '📋' },
    { href: '/admin/disputes', label: 'Disputes', icon: '⚖️' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
  ];

  return (
    <nav className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold">MishMeshMosh</span>
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded">
                ADMIN
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 capitalize">{userRole}</span>
            <Link
              href="/workspace"
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Exit Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
