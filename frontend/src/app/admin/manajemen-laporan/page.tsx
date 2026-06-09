"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManajemenLaporan() {
  const router = useRouter();
  const [laporan, setLaporan] = useState([]);
  const [userData, setUserData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/laporan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLaporan(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!userData) return <div className="p-xl text-center">Memuat...</div>;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'menunggu':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[12px] font-bold">
            <span className="w-2 h-2 rounded-full bg-on-surface-variant mr-xs"></span>
            Menunggu
          </span>
        );
      case 'approved':
      case 'diverifikasi':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full bg-status-urgent/10 text-status-urgent font-label-md text-[12px] font-bold">
            <span className="w-2 h-2 rounded-full bg-status-urgent mr-xs"></span>
            Diverifikasi
          </span>
        );
      case 'in_progress':
      case 'proses':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full bg-status-processing/10 text-[#8B6A1A] font-label-md text-[12px] font-bold">
            <span className="w-2 h-2 rounded-full bg-status-processing mr-xs"></span>
            Diproses
          </span>
        );
      case 'resolved':
      case 'selesai':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full bg-status-completed/10 text-status-completed font-label-md text-[12px] font-bold">
            <span className="w-2 h-2 rounded-full bg-status-completed mr-xs"></span>
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[12px] font-bold">
            <span className="w-2 h-2 rounded-full bg-on-surface-variant mr-xs"></span>
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredLaporan = laporan.filter((item: any) => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.nama_pelapor && item.nama_pelapor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.judul && item.judul.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let itemStatus = item.status?.toLowerCase();
    // Normalize status for filtering if needed
    if (itemStatus === 'menunggu') itemStatus = 'pending';
    if (itemStatus === 'diverifikasi') itemStatus = 'approved';
    if (itemStatus === 'proses') itemStatus = 'in_progress';
    if (itemStatus === 'selesai') itemStatus = 'resolved';

    const matchesStatus = filterStatus === '' || itemStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-surface text-on-surface font-body-md h-screen overflow-hidden flex antialiased">
      {/* SideNavBar Component */}
      <nav className="hidden md:flex flex-col py-lg px-md h-screen fixed left-0 top-0 w-[280px] border-r border-outline-variant shadow-sm bg-surface z-20">
        <div className="mb-xl px-sm">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Admin Portal</h1>
          <p className="font-caption text-caption text-on-surface-variant mt-xs">Pemerintah Kota</p>
        </div>
        <ul className="flex-1 flex flex-col gap-xs overflow-y-auto mt-lg">
          <li>
            <Link className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors active:scale-95 duration-150" href="/admin/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link className="flex items-center gap-md bg-secondary-container text-on-secondary-container rounded-lg px-md py-sm hover:bg-surface-container active:scale-95 duration-150" href="/admin/manajemen-laporan">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
              <span className="font-label-md text-label-md font-bold">Daftar Laporan</span>
            </Link>
          </li>
          {userData.role === 'super_admin' && (
            <li>
              <Link className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors active:scale-95 duration-150" href="/admin/kelola-user">
                <span className="material-symbols-outlined">manage_accounts</span>
                <span className="font-label-md text-label-md">Kelola User</span>
              </Link>
            </li>
          )}
        </ul>
        <div className="mt-auto pt-lg border-t border-outline-variant">
          <ul className="flex flex-col gap-xs">
            <li>
              <button onClick={handleLogout} className="w-full flex items-center gap-md text-error px-md py-sm hover:bg-error-container/20 rounded-lg transition-colors">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-label-md text-label-md">Keluar</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden bg-background">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-gutter border-b border-outline-variant bg-surface shrink-0 z-10">
          <div className="flex items-center gap-md md:hidden">
            <button className="text-on-surface-variant p-sm rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">SPJ</h1>
          </div>
          <div className="hidden md:block">
            {/* Breadcrumbs placeholder */}
          </div>
          <div className="flex items-center gap-md ml-auto">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-md text-label-md overflow-hidden border border-outline-variant">
              <span className="font-bold">{userData.nama_lengkap?.charAt(0) || 'A'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-gutter pb-xl">
          <div className="max-w-container-max mx-auto">
            <div className="mb-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Daftar Laporan</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Kelola dan pantau seluruh laporan infrastruktur masyarakat.</p>
              </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-md mb-lg border border-outline-variant flex flex-col lg:flex-row gap-md items-center justify-between">
              <div className="relative w-full lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant">search</span>
                </div>
                <input 
                  className="w-full pl-[48px] pr-md py-sm bg-surface-container-low rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant" 
                  placeholder="Cari Judul atau Pelapor..." 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-md w-full lg:w-auto">
                <select 
                  className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none min-w-[160px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Diverifikasi</option>
                  <option value="in_progress">Diproses</option>
                  <option value="resolved">Selesai</option>
                </select>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">ID Laporan</th>
                      <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Pelapor</th>
                      <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Kategori (Judul)</th>
                      <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Tanggal</th>
                      <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Status</th>
                      <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {filteredLaporan.map((item: any) => (
                      <tr key={item.id} className="hover:bg-surface-container transition-colors group">
                        <td className="py-md px-lg font-body-md text-body-md text-on-surface font-semibold">#{item.id.split('-').pop()}</td>
                        <td className="py-md px-lg font-body-md text-body-md text-on-surface">{item.nama_pelapor || 'Anonim'}</td>
                        <td className="py-md px-lg font-body-md text-body-md text-on-surface truncate max-w-[200px]" title={item.judul}>{item.judul}</td>
                        <td className="py-md px-lg font-body-md text-body-md text-on-surface-variant">{formatDate(item.created_at)}</td>
                        <td className="py-md px-lg">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-md px-lg text-right">
                          <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/detail-laporan/${item.id}`} className="text-on-surface-variant hover:text-primary bg-surface p-sm rounded-md transition-colors border border-outline-variant inline-flex" title="Detail">
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredLaporan.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-xl text-center text-on-surface-variant">
                          Tidak ada laporan yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="bg-surface-container-lowest border-t border-outline-variant p-md flex items-center justify-between">
                <span className="font-caption text-caption text-on-surface-variant">Menampilkan {filteredLaporan.length} laporan</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
