"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface PublicNavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ isLoggedIn: propIsLoggedIn, userName: propUserName, userAvatar: propUserAvatar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [userAvatar, setUserAvatar] = React.useState('');

  React.useEffect(() => {
    if (propIsLoggedIn !== undefined) {
      setIsLoggedIn(propIsLoggedIn);
      setUserName(propUserName || '');
      setUserAvatar(propUserAvatar || '');
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.nama_lengkap || '');
        setUserAvatar(user.avatar_url || '');
      } catch (e) {
        console.error('Error parsing user in PublicNavbar:', e);
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
      setUserAvatar('');
    }
  }, [propIsLoggedIn, propUserName, propUserAvatar]);

  const getHomePath = () => {
    if (!isLoggedIn) return '/';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' || user.role === 'super_admin') {
          return '/admin/dashboard';
        }
      }
      return '/pelapor/dashboard';
    } catch {
      return '/';
    }
  };

  const homePath = getHomePath();

  const navLinks = [
    { label: 'Home', path: homePath },
    { label: 'Lapor', path: '/pelapor/buat-laporan' },
    { label: 'Statistik', path: '/statistik' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-surface border-b border-outline-variant shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-gutter max-w-[1440px] mx-auto h-16">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_road</span>
          <Link href={homePath} className="text-headline-md font-bold text-primary tracking-tight hidden sm:block">
            Sistem Pengaduan Infrastruktur Jalan
          </Link>
          <Link href={homePath} className="text-headline-md font-bold text-primary tracking-tight sm:hidden">
            SPJ
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-md ml-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                className={`text-label-md px-sm py-1 rounded transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
                href={link.path}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-sm">
          {isLoggedIn ? (
            <div className="flex items-center gap-md">
              <button className="p-sm rounded-full hover:bg-surface-container-low transition-colors relative">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <div className="flex items-center gap-sm pl-md border-l border-outline-variant">
                <Link href="/pelapor/dashboard" className="text-right hidden md:block hover:opacity-80 transition-opacity">
                  <p className="text-label-md text-on-surface font-bold">{userName || 'Pengguna'}</p>
                  <p className="text-caption text-on-surface-variant">Warga Terverifikasi</p>
                </Link>
                <div className="group relative">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden cursor-pointer border border-primary/20">
                    {userAvatar ? (
                      <img alt={userName} className="w-full h-full object-cover" src={userAvatar} />
                    ) : (
                      <span className="text-label-md">{userName?.charAt(0) || 'P'}</span>
                    )}
                  </div>
                  {/* Simple Dropdown on Hover */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <Link href="/pelapor/dashboard" className="flex items-center gap-sm px-md py-sm hover:bg-surface-container-low text-on-surface">
                      <span className="material-symbols-outlined text-[20px]">dashboard</span>
                      <span className="text-label-md">Dashboard</span>
                    </Link>
                    <button 
                      onClick={() => { localStorage.clear(); router.push('/login'); }}
                      className="w-full flex items-center gap-sm px-md py-sm hover:bg-error-container/10 text-error text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-label-md">Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-xs">
              <Link href="/login" className="text-label-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm rounded-full hover:bg-surface-container-low">
                Masuk
              </Link>
              <Link href="/register" className="text-label-md bg-primary text-on-primary px-lg py-sm rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 shadow-sm">
                Daftar
              </Link>
            </div>
          )}
          <button className="md:hidden text-on-surface-variant p-sm">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
