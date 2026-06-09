"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicNavbar from '../../../components/PublicNavbar';
import PublicFooter from '../../../components/PublicFooter';

export default function DashboardPelapor() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.replace('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(userStr);
      setUserData(parsedUser);
    } catch (e) {
      console.error('Error parsing user data:', e);
      router.replace('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (userData) {
      fetchLaporan();
    }
  }, [userData]);

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

  const stats = {
    total: laporan.length,
    selesai: laporan.filter(l => l.status === 'selesai').length,
    proses: laporan.filter(l => l.status === 'proses' || l.status === 'diverifikasi').length
  };

  const recentLaporan = laporan.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selesai': return 'bg-tertiary-container/20 text-on-tertiary-container';
      case 'proses':
      case 'diverifikasi': return 'bg-secondary-container text-on-secondary-container';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="text-on-surface bg-background min-h-screen flex flex-col antialiased">
      <PublicNavbar isLoggedIn userName={userData.nama_lengkap} userAvatar={userData.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB77YBIyMzxKp3Qm_r4sN9bhTkfO-wqXTjRBRASF8x9METPUNf7lyS5k4TSoEnhYzdFtMS50MqUeHFua4vKPujDbKWvIYMY05PY7mNGBGsw0ccoEyAGZw6PNcVfBKseEXq0PkLoj6rMrrSCtJcPhwmFCr67mtHRhcZ3JoBxYGO4D2uB1hiksKi1MxiCIIXcn0DDghLvHzfc4TzacpfXwzLcCvA-s0jsLzcY3ZpjjoWMuIxQo8jFTUmcywN8iKJo3AB5H2Z-98hpjHhv'} />

      <main className="flex-grow py-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto w-full space-y-xl">
        {/* Hero */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-lg">
          <div className="space-y-sm">
            <h1 className="text-display-lg text-primary tracking-tight">Halo, {userData.nama_lengkap}</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Selamat datang kembali di portal aspirasi infrastruktur. Kontribusi Anda sangat berarti bagi kenyamanan dan keamanan transportasi kota kita.</p>
          </div>
          <Link href="/pelapor/buat-laporan" className="flex items-center gap-sm bg-primary text-on-primary px-xl py-md rounded-xl text-label-md hover:shadow-lg active:scale-95 transition-all whitespace-nowrap">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Buat Laporan Baru
          </Link>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="unboxed-card p-lg">
            <div className="flex items-center justify-between mb-md">
              <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <span className="text-caption px-sm py-xs bg-surface-variant text-on-surface-variant rounded-full">Total</span>
            </div>
            <h3 className="text-label-md text-on-surface-variant">Total Laporan Saya</h3>
            <p className="text-headline-lg text-on-surface mt-1">{stats.total}</p>
          </div>
          <div className="unboxed-card p-lg">
            <div className="flex items-center justify-between mb-md">
              <span className="material-symbols-outlined text-tertiary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-caption px-sm py-xs bg-tertiary-container/20 text-on-tertiary-container rounded-full">Selesai</span>
            </div>
            <h3 className="text-label-md text-on-surface-variant">Laporan Selesai</h3>
            <p className="text-headline-lg text-on-surface mt-1">{stats.selesai}</p>
          </div>
          <div className="unboxed-card p-lg">
            <div className="flex items-center justify-between mb-md">
              <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
              <span className="text-caption px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full">Diproses</span>
            </div>
            <h3 className="text-label-md text-on-surface-variant">Dalam Proses</h3>
            <p className="text-headline-lg text-on-surface mt-1">{stats.proses}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          <section className="lg:col-span-2 space-y-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-md text-on-surface">Laporan Terbaru</h2>
              <Link href="/pelapor/lihat-laporan" className="text-primary text-label-md hover:underline">Lihat Semua</Link>
            </div>
            <div className="space-y-md">
              {isLoading ? (
                <div className="text-center py-xl">
                  <p className="text-on-surface-variant">Memuat laporan...</p>
                </div>
              ) : recentLaporan.length > 0 ? (
                recentLaporan.map((item) => (
                  <Link 
                    href={`/laporan/${item.id}`} 
                    key={item.id} 
                    className="flex items-center gap-lg unboxed-card p-md hover:bg-surface-container/30 hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer block text-left"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                      {item.foto_url ? (
                        <img alt={item.judul} className="w-full h-full object-cover" src={`http://localhost:5000${item.foto_url}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-on-surface font-bold text-[16px]">{item.judul}</h4>
                        <span className={`${getStatusColor(item.status)} text-caption px-md py-xs rounded-full font-bold uppercase`}>{item.status}</span>
                      </div>
                      <p className="text-body-md text-on-surface-variant line-clamp-1">{item.deskripsi}</p>
                      <div className="flex items-center gap-sm text-caption text-outline">
                        <span className="material-symbols-outlined text-sm">schedule</span>{formatDate(item.created_at)}
                        <span className="material-symbols-outlined text-sm ml-md">location_on</span>{item.lokasi_jalan}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-xl bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                  <p className="text-on-surface-variant">Belum ada laporan yang dibuat.</p>
                  <Link href="/pelapor/buat-laporan" className="text-primary text-label-md mt-2 inline-block">Buat Laporan Pertama Anda</Link>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-xl">
            <div className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-md">
                <span className="material-symbols-outlined text-4xl opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                <h3 className="text-headline-md">Dampak Anda</h3>
                <p className="text-body-md opacity-90">Laporan Anda sangat berarti bagi kenyamanan dan keamanan transportasi kota kita.</p>
                <div className="pt-sm">
                  <div className="w-full bg-on-primary/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-tertiary-fixed h-full" style={{ width: `${Math.min((stats.selesai / (stats.total || 1)) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-caption mt-xs opacity-80">{stats.selesai} dari {stats.total} laporan selesai diperbaiki</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-on-primary/10 rounded-full"></div>
            </div>
            <div className="unboxed-card p-lg space-y-md">
              <h3 className="text-label-md text-on-surface-variant uppercase tracking-widest">Pusat Bantuan</h3>
              <p className="text-body-md text-on-surface-variant">Membutuhkan bantuan terkait layanan kami?</p>
              <button className="w-full py-2 bg-surface-container-high text-on-surface rounded-lg text-label-md hover:bg-surface-container-highest transition-colors">Hubungi Kami</button>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
