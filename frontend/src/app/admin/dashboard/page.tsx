"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/');
    } else {
      setUserData(user);
      fetchLaporan();
    }
  }, [router]);

  const fetchLaporan = async () => {
    try {
      const res = await api.get('/laporan');
      const data = res.data;
      setLaporan(data);
      
      let pending = 0;
      let in_progress = 0;
      let resolved = 0;

      data.forEach((item: any) => {
        const s = item.status?.toLowerCase();
        if (s === 'pending' || s === 'menunggu') pending++;
        else if (s === 'in_progress' || s === 'proses') in_progress++;
        else if (s === 'resolved' || s === 'selesai') resolved++;
      });

      setStats({
        total: data.length,
        pending,
        in_progress,
        resolved
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!userData) return <div className="p-xl text-center bg-surface min-h-screen text-on-surface">Memuat Dashboard...</div>;

  const latestLaporan = laporan.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'menunggu':
        return <span className="inline-flex px-sm py-xs bg-error-container/20 text-error font-label-md rounded-full text-xs">Menunggu</span>;
      case 'approved':
      case 'diverifikasi':
        return <span className="inline-flex px-sm py-xs bg-tertiary-fixed text-tertiary font-label-md rounded-full text-xs">Diverifikasi</span>;
      case 'in_progress':
      case 'proses':
        return <span className="inline-flex px-sm py-xs bg-secondary-fixed text-secondary font-label-md rounded-full text-xs">Diproses</span>;
      case 'resolved':
      case 'selesai':
        return <span className="inline-flex px-sm py-xs bg-primary-fixed-dim/40 text-primary font-label-md rounded-full text-xs">Selesai</span>;
      default:
        return <span className="inline-flex px-sm py-xs bg-surface-variant text-on-surface font-label-md rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="font-body-md text-on-surface flex bg-background min-h-screen">
      {/* SideNavBar */}
      <aside className="h-screen w-[280px] fixed left-0 top-0 flex flex-col py-xl bg-surface border-r border-outline-variant z-50 hidden md:flex">
        <div className="px-lg mb-xl">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">Admin Portal</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Sistem Pengaduan Jalan</p>
        </div>
        <nav className="flex-1 px-sm space-y-xs overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-md px-lg py-sm border-l-4 border-primary bg-primary-fixed-dim/20 text-primary font-bold transition-all opacity-90 scale-[0.99]">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link href="/admin/manajemen-laporan" className="flex items-center gap-md px-lg py-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined">assignment</span>
            <span className="font-label-md text-label-md">Daftar Laporan</span>
          </Link>
          {userData.role === 'super_admin' && (
            <Link href="/admin/kelola-user" className="flex items-center gap-md px-lg py-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-200">
              <span className="material-symbols-outlined">engineering</span>
              <span className="font-label-md text-label-md">Manajemen Petugas</span>
            </Link>
          )}
        </nav>
        <div className="px-sm space-y-xs border-t border-outline-variant pt-lg mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-md px-lg py-sm text-error hover:bg-error-container/20 transition-colors rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:ml-[280px]">
        {/* TopNavBar */}
        <header className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant">
          <div className="flex items-center gap-lg flex-1">
            <div className="flex items-center gap-md md:hidden">
              <button className="text-on-surface-variant p-sm rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="font-headline-md text-headline-md font-bold text-primary">SPJ</h1>
            </div>
            <div className="relative w-full max-w-md hidden md:block">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full bg-surface-container border-none rounded-full pl-xl py-xs font-body-md text-on-surface focus:ring-2 focus:ring-primary/50" placeholder="Cari laporan atau petugas..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="p-sm text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/50 rounded-full">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant mx-sm"></div>
            <div className="flex items-center gap-sm">
              <div className="text-right hidden lg:block">
                <p className="font-label-md text-label-md text-on-surface">{userData.nama_lengkap}</p>
                <p className="text-caption text-on-surface-variant">{userData.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold border border-outline-variant">
                {userData.nama_lengkap?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-margin-mobile md:p-xl max-w-[1160px] mx-auto w-full">
          <div className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Ringkasan Dashboard</h2>
            <p className="font-body-md text-on-surface-variant">Pantau status perbaikan infrastruktur jalan secara real-time.</p>
          </div>

          {/* Key Statistics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <div className="flex items-center gap-md mb-md">
                <div className="p-sm bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">Total Laporan</span>
              </div>
              <p className="font-display-lg text-display-lg text-primary">{stats.total}</p>
            </div>

            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <div className="flex items-center gap-md mb-md">
                <div className="p-sm bg-tertiary/10 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary">pending_actions</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">Menunggu Verifikasi</span>
              </div>
              <p className="font-display-lg text-display-lg text-tertiary">{stats.pending}</p>
            </div>

            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <div className="flex items-center gap-md mb-md">
                <div className="p-sm bg-secondary/10 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">construction</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">Dalam Pengerjaan</span>
              </div>
              <p className="font-display-lg text-display-lg text-secondary">{stats.in_progress}</p>
            </div>

            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <div className="flex items-center gap-md mb-md">
                <div className="p-sm bg-primary-container/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary-container">check_circle</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">Selesai Diperbaiki</span>
              </div>
              <p className="font-display-lg text-display-lg text-primary-container">{stats.resolved}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Latest Reports Table */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
              <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Laporan Terbaru</h3>
                <Link href="/admin/manajemen-laporan" className="text-primary font-label-md text-label-md hover:underline transition-all">Lihat Semua</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30">
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">ID</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Lokasi / Judul</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tingkat</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {latestLaporan.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-lg py-md font-label-md">#{item.id.split('-').pop()}</td>
                        <td className="px-lg py-md font-body-md truncate max-w-[200px]" title={item.judul}>{item.judul}</td>
                        <td className="px-lg py-md font-body-md capitalize">{item.tingkat_kerusakan}</td>
                        <td className="px-lg py-md">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    ))}
                    {latestLaporan.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-lg py-xl text-center text-on-surface-variant">Tidak ada laporan terbaru.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technician Availability placeholder */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
              <div className="px-lg py-md border-b border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-on-surface">Ketersediaan Petugas</h3>
              </div>
              <div className="p-lg flex-1 space-y-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold">BS</div>
                    <div>
                      <p className="font-label-md text-on-surface">Budi Santoso</p>
                      <p className="text-caption text-on-surface-variant">Tim A</p>
                    </div>
                  </div>
                  <span className="text-caption font-bold text-green-600">TERSEDIA</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold">AH</div>
                    <div>
                      <p className="font-label-md text-on-surface">Ahmad Hidayat</p>
                      <p className="text-caption text-on-surface-variant">Tim B</p>
                    </div>
                  </div>
                  <span className="text-caption font-bold text-yellow-600">DILOKASI</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
