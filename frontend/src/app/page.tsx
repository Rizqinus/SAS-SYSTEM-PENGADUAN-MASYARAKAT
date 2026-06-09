"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.nama_lengkap || '');
        if (user.role === 'admin' || user.role === 'super_admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/pelapor/dashboard');
        }
      } catch (e) {
        console.error('Error parsing user on LandingPage:', e);
      }
    }
  }, [router]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <PublicNavbar isLoggedIn={isLoggedIn} userName={userName} />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-margin-mobile md:px-gutter py-margin-desktop flex flex-col gap-[64px]">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center gap-xl">
          <div className="flex-1 flex flex-col gap-md">
            <div className="inline-flex items-center gap-sm bg-surface-container-low px-sm py-xs rounded-full w-max border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="text-label-md text-on-surface-variant">Transparansi Layanan Publik</span>
            </div>
            <h1 className="text-display-lg text-on-background" style={{ textWrap: 'balance' }}>
              Mewujudkan Infrastruktur Kota yang Lebih Baik, Bersama.
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-[600px] mt-sm">
              Sistem Pengaduan Infrastruktur Jalan (SPIJ) adalah jembatan digital antara warga dan pemerintah kota. Kami mempermudah pelaporan kerusakan jalan untuk mempercepat proses perbaikan secara transparan dan akuntabel.
            </p>
            <div className="mt-lg">
              <Link href="/pelapor/buat-laporan" className="text-label-md bg-primary text-on-primary px-xl py-md rounded-full shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-sm">
                Mulai Laporan Baru
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-outline-variant relative">
              <img alt="Modern city infrastructure" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBspD2qGBmN44GpeyD2z9BDGLOp-e3yi65s-ZoIVZSCcCznpVCzcQxmY-jrbEoHsB-7wYy8MwoUxhhe6KP-pgHZcMJVILof7sUVpNiwGKo7RCZ-ZUfVbbmQxbeGps7-w5qdNMMolJ4dEXR962d-01IH0ocoG_lqn9UTleU35Rc8rDjmB7aM1dTdrM8E3gk27PofLI6ZB-hgEJ9aoYCzNJ2PRzBtiUwp-RLqoiqIdcf8T3N4Qiyx6VupvgjOeL_FS0BKzFlSvIX5UUD4" />
              <div className="absolute bottom-md left-md bg-surface/90 backdrop-blur-sm p-sm rounded-lg border border-outline-variant flex items-center gap-sm shadow-sm">
                <div className="bg-primary/10 p-xs rounded-full">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <p className="text-label-md text-on-surface">Laporan Terverifikasi</p>
                  <p className="text-caption text-on-surface-variant">Update real-time</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="flex flex-col gap-xl items-center text-center">
          <div className="max-w-[700px]">
            <h2 className="text-headline-lg text-on-background mb-sm">Alur Penanganan Laporan</h2>
            <p className="text-body-md text-on-surface-variant">Sistem kami dirancang untuk meminimalkan birokrasi. Setiap laporan yang masuk akan melewati proses yang terstruktur dan dapat dipantau oleh publik.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg w-full relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-surface-variant -z-10 -translate-y-5"></div>
            <div className="unboxed-card p-lg relative z-10">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-md mx-auto ring-4 ring-background">
                <span className="material-symbols-outlined text-[32px] text-on-secondary-container">add_location_alt</span>
              </div>
              <h3 className="text-headline-md text-on-surface mb-1">1. Lapor</h3>
              <p className="text-body-md text-on-surface-variant">Kirim foto, deskripsi, dan titik lokasi kerusakan jalan melalui platform. Data Anda aman dan terenkripsi.</p>
            </div>
            <div className="unboxed-card p-lg relative z-10">
              <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mb-md mx-auto ring-4 ring-background">
                <span className="material-symbols-outlined text-[32px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
              </div>
              <h3 className="text-headline-md text-on-surface mb-1">2. Verifikasi</h3>
              <p className="text-body-md text-on-surface-variant">Tim teknis meninjau laporan, menilai tingkat keparahan, dan menjadwalkan tindakan perbaikan yang diperlukan.</p>
            </div>
            <div className="unboxed-card p-lg relative z-10">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-md mx-auto ring-4 ring-background">
                <span className="material-symbols-outlined text-[32px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
              </div>
              <h3 className="text-headline-md text-on-surface mb-1">3. Perbaikan</h3>
              <p className="text-body-md text-on-surface-variant">Petugas lapangan mengeksekusi perbaikan jalan. Status laporan diperbarui hingga masalah dinyatakan selesai.</p>
            </div>
          </div>
        </section>

        {/* Bento Grid: Impact */}
        <section className="flex flex-col gap-lg">
          <h2 className="text-headline-lg text-on-background">Dampak bagi Kota</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-md h-auto md:h-[500px]">
            <div className="col-span-1 md:col-span-2 md:row-span-2 unboxed-card overflow-hidden relative group">
              <img alt="Data visualization" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9LgtTKZGmVb8myjM6UE31KpkgrVB2azyCjkbY2BKgsqcX-4OU_0kINTGbsZuzcXKArPd_cxQjWgMB56ExELgwKN-6BLdAB2oy08IKv4AQNQtefHo-2ioP7KO6p5J8bAgLsy7aht4Hk6TU4JnhobqsAFI8E2Unv7raAi2UtZuYsbsRXuIMCgin_RYW7OyZMH_EAMAKwftxklrwseJ9C7lAkqO65rWwuTqHJkW5QAm03HIayOXa-99Agr-SJP_6Tm_E_vOE7duaS7Zx" />
              <div className="relative h-full flex flex-col justify-end p-lg bg-gradient-to-t from-surface to-transparent">
                <span className="material-symbols-outlined text-primary text-[40px] mb-sm">monitoring</span>
                <h3 className="text-display-lg text-on-background mb-1">Transparansi Data Publik</h3>
                <p className="text-body-lg text-on-surface-variant">Setiap warga berhak mengetahui perkembangan infrastruktur kotanya. Sistem ini menyediakan data statistik real-time.</p>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 bg-primary-container rounded-xl p-lg flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-on-primary-container text-[32px] mb-1">timer</span>
                <h3 className="text-headline-md text-on-primary-container">Respons Lebih Cepat</h3>
                <p className="text-body-md text-on-primary-container/80 mt-1">Memangkas rantai birokrasi konvensional, memungkinkan tim lapangan menerima instruksi kerja langsung dari laporan warga.</p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary opacity-20 rounded-full blur-2xl"></div>
            </div>
            <div className="col-span-1 md:col-span-1 unboxed-card p-lg flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-tertiary text-[40px] mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
              <h3 className="text-label-md text-on-surface">Keselamatan Berkendara</h3>
              <p className="text-caption text-on-surface-variant mt-1">Mengurangi risiko kecelakaan akibat jalan berlubang.</p>
            </div>
            <div className="col-span-1 md:col-span-1 bg-surface-container-highest rounded-xl p-lg flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-on-surface text-[40px] mb-sm">group</span>
              <h3 className="text-label-md text-on-surface">Partisipasi Aktif</h3>
              <p className="text-caption text-on-surface-variant mt-1">Membangun rasa kepemilikan warga terhadap fasilitas publik.</p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
