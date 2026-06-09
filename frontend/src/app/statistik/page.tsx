"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

interface Laporan {
  id: string;
  judul: string;
  deskripsi: string;
  lokasi_jalan: string;
  tingkat_kerusakan: string;
  status: string;
  created_at: string;
}

export default function StatistikPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) {
      setIsLoggedIn(true);
      setUserName(user.nama_lengkap || '');
    }

    const fetchLaporan = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/laporan');
        if (response.ok) {
          const data = await response.json();
          setLaporan(data);
        }
      } catch (error) {
        console.error('Error fetching laporan for stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaporan();
  }, []);

  const totalLaporan = laporan.length;
  const selesaiCount = laporan.filter(l => l.status === 'resolved' || l.status === 'selesai').length;
  const prosesCount = laporan.filter(l => l.status === 'in_progress' || l.status === 'proses').length;
  const pendingCount = laporan.filter(l => l.status === 'pending' || l.status === 'menunggu' || l.status === 'approved' || l.status === 'diverifikasi').length;

  const rasioPerbaikan = totalLaporan > 0 ? Math.round((selesaiCount / totalLaporan) * 100) : 0;

  // Breakdown by damage severity
  const beratCount = laporan.filter(l => l.tingkat_kerusakan === 'berat').length;
  const sedangCount = laporan.filter(l => l.tingkat_kerusakan === 'sedang').length;
  const ringanCount = laporan.filter(l => l.tingkat_kerusakan === 'ringan').length;

  const beratPct = totalLaporan > 0 ? Math.round((beratCount / totalLaporan) * 100) : 0;
  const sedangPct = totalLaporan > 0 ? Math.round((sedangCount / totalLaporan) * 100) : 0;
  const ringanPct = totalLaporan > 0 ? Math.round((ringanCount / totalLaporan) * 100) : 0;

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'menunggu': return 'bg-surface-container text-on-surface-variant';
      case 'approved':
      case 'diverifikasi': return 'bg-blue-100 text-blue-700';
      case 'in_progress':
      case 'proses': return 'bg-amber-100 text-amber-700';
      case 'resolved':
      case 'selesai': return 'bg-green-100 text-green-700';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'menunggu': return 'Menunggu';
      case 'approved':
      case 'diverifikasi': return 'Diverifikasi';
      case 'in_progress':
      case 'proses': return 'Diproses';
      case 'resolved':
      case 'selesai': return 'Selesai';
      default: return status;
    }
  };

  return (
    <div className="text-on-surface bg-background min-h-screen flex flex-col antialiased">
      <PublicNavbar isLoggedIn={isLoggedIn} userName={userName} />

      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex-grow w-full">
        {/* Hero */}
        <section className="mb-xl text-center md:text-left">
          <div className="max-w-3xl">
            <h1 className="text-display-lg font-bold text-primary mb-md">Statistik Real-time Perbaikan Jalan</h1>
            <p className="text-body-lg text-on-surface-variant">Transparansi data untuk kemajuan infrastruktur kota. Pantau setiap laporan warga, proses verifikasi, hingga penyelesaian konstruksi secara terbuka dan akuntabel.</p>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <div className="unboxed-card p-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">assignment</span>
              </div>
              <span className="text-label-md text-primary font-bold">Terintegrasi</span>
            </div>
            <div className="mt-lg">
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Laporan Warga</p>
              <h2 className="text-display-lg font-bold text-primary mt-1">{isLoading ? '...' : totalLaporan}</h2>
            </div>
          </div>
          <div className="unboxed-card p-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              </div>
              <span className="text-label-md text-tertiary font-bold">{isLoading ? '...' : rasioPerbaikan}% Rasio</span>
            </div>
            <div className="mt-lg">
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Selesai Diperbaiki</p>
              <h2 className="text-display-lg font-bold text-tertiary mt-1">{isLoading ? '...' : selesaiCount}</h2>
            </div>
          </div>
          <div className="unboxed-card p-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <span className="text-label-md text-secondary font-bold">Aktif Diproses</span>
            </div>
            <div className="mt-lg">
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Sedang Dikerjakan</p>
              <h2 className="text-display-lg font-bold text-secondary mt-1">{isLoading ? '...' : prosesCount}</h2>
            </div>
          </div>
        </div>

        {/* Charts and Severity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
          <div className="lg:col-span-2 unboxed-card p-lg flex flex-col justify-between">
            <div>
              <h3 className="text-headline-md font-bold text-on-surface">Visualisasi Status Pengaduan</h3>
              <p className="text-body-md text-on-surface-variant">Proporsi perbandingan status pengaduan saat ini</p>
            </div>
            <div className="h-64 w-full relative flex items-end gap-lg pt-lg mt-md">
              <div className="flex-1 flex flex-col items-center gap-sm">
                <div 
                  className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t-lg relative flex items-end justify-center" 
                  style={{ height: totalLaporan > 0 ? `${(pendingCount / totalLaporan) * 200}px` : '20px' }}
                >
                  <div className="bg-primary w-full rounded-t-lg" style={{ height: '70%' }}></div>
                  <span className="absolute -top-7 text-label-md font-bold text-primary">{pendingCount}</span>
                </div>
                <span className="text-label-md text-on-surface-variant text-center">Menunggu / Diverifikasi</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-sm">
                <div 
                  className="w-full bg-secondary/20 hover:bg-secondary/30 transition-colors rounded-t-lg relative flex items-end justify-center" 
                  style={{ height: totalLaporan > 0 ? `${(prosesCount / totalLaporan) * 200}px` : '20px' }}
                >
                  <div className="bg-secondary w-full rounded-t-lg" style={{ height: '75%' }}></div>
                  <span className="absolute -top-7 text-label-md font-bold text-secondary">{prosesCount}</span>
                </div>
                <span className="text-label-md text-on-surface-variant text-center">Sedang Diproses</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-sm">
                <div 
                  className="w-full bg-green-200 hover:bg-green-300 transition-colors rounded-t-lg relative flex items-end justify-center" 
                  style={{ height: totalLaporan > 0 ? `${(selesaiCount / totalLaporan) * 200}px` : '20px' }}
                >
                  <div className="bg-green-600 w-full rounded-t-lg" style={{ height: '80%' }}></div>
                  <span className="absolute -top-7 text-label-md font-bold text-green-700">{selesaiCount}</span>
                </div>
                <span className="text-label-md text-on-surface-variant text-center">Selesai Diperbaiki</span>
              </div>
            </div>
          </div>
          <div className="unboxed-card p-lg flex flex-col justify-between">
            <h3 className="text-headline-md font-bold text-on-surface mb-md">Breakdown Tingkat Kerusakan</h3>
            <div className="flex-grow flex flex-col justify-center gap-lg">
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[12px] border-surface-container relative flex items-center justify-center">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-headline-lg font-bold text-primary">{beratPct}%</span>
                    <span className="text-caption text-on-surface-variant font-semibold">Tingkat Mendesak</span>
                  </div>
                </div>
              </div>
              <div className="space-y-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-error"></span>
                    <span className="text-body-md font-semibold">Mendesak (Berat)</span>
                  </div>
                  <span className="text-label-md font-bold">{beratPct}% ({beratCount})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-body-md font-semibold">Sedang</span>
                  </div>
                  <span className="text-label-md font-bold">{sedangPct}% ({sedangCount})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-body-md font-semibold">Biasa (Ringan)</span>
                  </div>
                  <span className="text-label-md font-bold">{ringanPct}% ({ringanCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Public Reports */}
        <section className="unboxed-card overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <div>
              <h3 className="text-headline-md font-bold text-on-surface">Daftar Pengaduan Terbaru</h3>
              <p className="text-body-md text-on-surface-variant">Laporan infrastruktur jalan yang dikirimkan warga</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-lg py-md text-label-md text-on-surface-variant uppercase font-semibold">ID</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant uppercase font-semibold">Judul Kerusakan</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant uppercase font-semibold">Lokasi Jalan</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant uppercase font-semibold">Tingkat Kerusakan</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant uppercase font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">Memuat laporan...</td>
                  </tr>
                ) : laporan.length > 0 ? (
                  laporan.slice(0, 5).map(r => (
                    <tr key={r.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-lg py-md text-body-md font-semibold">
                        <Link href={`/laporan/${r.id}`} className="text-primary hover:underline">
                          #{r.id}
                        </Link>
                      </td>
                      <td className="px-lg py-md text-body-md font-bold">{r.judul}</td>
                      <td className="px-lg py-md text-body-md">{r.lokasi_jalan}</td>
                      <td className="px-lg py-md uppercase text-caption font-bold">
                        <span className={`px-sm py-xs rounded border ${
                          r.tingkat_kerusakan === 'berat' ? 'bg-error-container/20 text-error border-error-variant' :
                          r.tingkat_kerusakan === 'sedang' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {r.tingkat_kerusakan}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <span className={`px-md py-xs rounded-full text-caption font-bold uppercase ${getStatusBadgeColor(r.status)}`}>
                          {getStatusLabel(r.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">Tidak ada laporan ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-xl relative rounded-3xl overflow-hidden min-h-[300px] flex items-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px]"></div>
          </div>
          <div className="relative z-10 px-margin-desktop py-lg text-white max-w-2xl">
            <h2 className="text-display-lg font-bold mb-md">Bantu Kami Memperbaiki Kota Anda</h2>
            <p className="text-body-lg mb-lg opacity-90">Setiap laporan Anda adalah langkah nyata menuju infrastruktur yang lebih aman dan nyaman bagi semua warga.</p>
            <Link href="/pelapor/buat-laporan" className="bg-white text-primary px-xl py-md rounded-full text-label-md hover:shadow-lg active:scale-95 font-bold transition-all inline-block">Lapor Sekarang</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
