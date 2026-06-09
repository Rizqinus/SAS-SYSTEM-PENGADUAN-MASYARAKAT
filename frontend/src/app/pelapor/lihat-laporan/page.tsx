"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicNavbar from '../../../components/PublicNavbar';
import PublicFooter from '../../../components/PublicFooter';

export default function LihatLaporan() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.replace('/login');
      return;
    }
    try {
      setUserData(JSON.parse(userStr));
    } catch (e) {
      console.error('Error parsing user data:', e);
      router.replace('/login');
      return;
    }
    fetchLaporan();
  }, [router]);

  const fetchLaporan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/laporan/my/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLaporan(data);
      }
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) return null;

  const filteredLaporan = laporan.filter((l: any) => {
    if (filter === 'all') return true;
    return l.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'menunggu': return { label: 'Menunggu Verifikasi', icon: 'pending_actions', color: 'bg-surface-container-highest text-on-surface border-outline-variant' };
      case 'diverifikasi': return { label: 'Diverifikasi', icon: 'fact_check', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'proses': return { label: 'Sedang Diperbaiki', icon: 'construction', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'selesai': return { label: 'Selesai', icon: 'check_circle', color: 'bg-green-100 text-green-800 border-green-200' };
      default: return { label: status, icon: 'info', color: 'bg-surface-variant text-on-surface-variant' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="text-on-background min-h-screen flex flex-col bg-background antialiased">
      <PublicNavbar isLoggedIn userName={userData.nama_lengkap} userAvatar={userData.avatar_url} />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        <div className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h1 className="text-display-lg text-on-surface mb-sm">Riwayat Laporan</h1>
            <p className="text-body-lg text-on-surface-variant">Pantau status laporan kerusakan jalan yang telah Anda kirimkan.</p>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">filter_list</span>
            <select 
              className="pl-10 pr-8 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary appearance-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="menunggu">Menunggu Verifikasi</option>
              <option value="diverifikasi">Diverifikasi</option>
              <option value="proses">Sedang Diperbaiki</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-on-surface-variant">Memuat laporan...</p>
          </div>
        ) : filteredLaporan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filteredLaporan.map((r: any) => {
              const status = getStatusDisplay(r.status);
              return (
                <article key={r.id} className="unboxed-card overflow-hidden flex flex-col h-full">
                  <div className="relative h-48 w-full">
                    {r.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={r.judul} className="w-full h-full object-cover" src={`http://localhost:5000${r.foto_url}`} />
                    ) : (
                      <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-variant text-[64px]">image_not_supported</span>
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 ${status.color} px-sm py-xs rounded-full text-label-md flex items-center gap-1 shadow-sm border`}>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{status.icon}</span>
                      {status.label}
                    </div>
                  </div>
                  <div className="p-lg flex flex-col flex-grow">
                    <div className="text-caption text-on-surface-variant mb-xs">{formatDate(r.created_at)} • ID: #{r.id}</div>
                    <h2 className="text-headline-md text-on-surface mb-sm">{r.judul}</h2>
                    <p className="text-body-md text-on-surface-variant mb-md flex-grow line-clamp-2">{r.deskripsi}</p>
                    <div className="flex items-center gap-sm text-caption text-outline mb-md">
                      <span className="material-symbols-outlined text-sm">location_on</span>{r.lokasi_jalan}
                    </div>
                    <Link href={`/laporan/${r.id}`} className="mt-auto w-full py-sm border border-outline text-primary text-label-md rounded-lg hover:bg-surface-container-low transition-colors text-center block">Lihat Detail</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
            <p className="text-on-surface-variant">Tidak ada laporan ditemukan{filter !== 'all' ? ' untuk status ini' : ''}.</p>
            {filter === 'all' && (
              <Link href="/pelapor/buat-laporan" className="text-primary text-label-md mt-2 inline-block">Buat Laporan Pertama Anda</Link>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
