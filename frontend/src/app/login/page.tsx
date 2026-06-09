"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' || user.role === 'super_admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/pelapor/dashboard');
        }
      } catch (e) {
        console.error('Error parsing user on Login mount:', e);
      }
    }
  }, [router]);

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // Clear error on typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/login', {
        email: formData.identifier, // API expects 'email'
        password: formData.password
      });

      const data = response.data;

      // Success
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Tampilkan Peringatan Keberhasilan (Alert)
      alert(`Login Berhasil!\nSelamat datang kembali, ${data.user.nama_lengkap}.`);
      
      // Arahkan ke dashboard sesuai role
      if (data.user.role === 'admin' || data.user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/pelapor/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal login. Periksa kembali kredensial Anda.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen text-body-md">
      {/* Main Container - Split Screen Layout */}
      <main className="flex min-h-screen w-full">
        {/* Left Side - Form Area */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center px-margin-mobile sm:px-lg md:px-xl lg:px-margin-desktop xl:px-32 bg-surface">
          <div className="flex-1 flex flex-col justify-center max-w-[480px] w-full mx-auto">
            <header className="mb-xl flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_road</span>
              <h1 className="text-headline-md text-primary">Sistem Pengaduan Infrastruktur Jalan</h1>
            </header>

            <div className="w-full">
              <h2 className="text-headline-lg text-on-surface mb-sm">Selamat Datang Kembali</h2>
              <p className="text-body-md text-on-surface-variant mb-lg">Masuk untuk melaporkan kerusakan jalan dan pantau status perbaikannya.</p>

              {/* Tampilkan pesan error jika ada */}
              {errorMsg && (
                <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg border border-error/50 flex items-center gap-sm text-body-md">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {errorMsg}
                </div>
              )}

              <form className="space-y-lg" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-label-md text-on-surface mb-xs" htmlFor="identifier">Email atau NIK</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                    </div>
                    <input 
                      className="block w-full px-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-body-md text-on-surface transition-colors outline-none font-medium" 
                      id="identifier" 
                      name="identifier" 
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder="Masukkan Email atau NIK Anda" 
                      required 
                      type="text" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-xs">
                    <label className="block text-label-md text-on-surface" htmlFor="password">Kata Sandi</label>
                    <a className="text-label-md text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded" href="#">Lupa Kata Sandi?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                    </div>
                    <input 
                      className="block w-full px-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-body-md text-on-surface transition-colors outline-none font-medium" 
                      id="password" 
                      name="password" 
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      required 
                      type="password" 
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface-container-lowest cursor-pointer" id="remember-me" name="remember-me" type="checkbox" />
                  <label className="ml-sm block text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                    Ingat saya di perangkat ini
                  </label>
                </div>

                <div>
                  <button 
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-3 px-lg border border-transparent rounded-lg shadow-sm text-label-md text-on-primary bg-primary hover:bg-on-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer font-bold ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                    type="submit"
                  >
                    {isLoading ? 'Memproses...' : 'Masuk'}
                  </button>
                </div>
              </form>
              {/* Registration Link */}
              <div className="mt-lg text-center">
                <p className="text-body-md text-on-surface-variant">
                  Belum punya akun?
                  <Link className="text-label-md text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded ml-1 font-bold" href="/register">Daftar Sekarang</Link>
                </p>
              </div>
              {/* Divider */}
              <div className="mt-xl flex items-center">
                <div className="flex-grow border-t border-outline-variant"></div>
                <span className="flex-shrink-0 mx-md text-caption text-outline">Atau</span>
                <div className="flex-grow border-t border-outline-variant"></div>
              </div>
              {/* Citizen Information Note */}
              <div className="mt-lg p-md bg-surface-container-low rounded-lg border border-outline-variant flex gap-md items-start">
                <span className="material-symbols-outlined text-primary mt-xs">info</span>
                <div>
                  <h4 className="text-label-md text-on-surface font-bold">Portal Resmi Pemerintah</h4>
                  <p className="text-caption text-on-surface-variant mt-xs">Data Anda dilindungi oleh sistem keamanan nasional. Pastikan URL situs diawali dengan https://spij.go.id</p>
                </div>
              </div>
            </div>
          </div>
          {/* Simple Footer just for the login screen */}
          <footer className="py-xl max-w-[480px] w-full mx-auto">
            <p className="text-caption text-outline-variant text-center md:text-left">© 2026 Sistem Pengaduan Infrastruktur Jalan. Layanan Publik Digital.</p>
          </footer>
        </section>
        {/* Right Side - Hero Image (Hidden on mobile) */}
        <section className="hidden lg:block lg:w-1/2 relative bg-surface-container-high">
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10"></div>
          <img alt="Pembangunan infrastruktur jalan yang modern dan efisien" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsKCDm5WLAG3igGKMgYnwoj75RRYAxxnBrP69R4hW9zYqdLIgDc7iChSoBJzqHwGMt9c7TeIWIRpeiWwmBeWBWPggUA8oNe66pZUcGwkvXS3xwSJ3PpgDHlbLkeIsqhsLphNIw31Rekl3vtONBKetKYmZne2gTJxEqa2AY2msJeejf4_U6pkkuwIfO_NNdjaACdjtam-ciepcLHiV4_zNUSUYJm3mjv5DCYof0eJstqIvpuc3-X4MD_H5vuYwHxsrSRAoxb3I4gkX_" />
          <div className="absolute bottom-16 right-16 z-20 w-[360px] p-6 bg-surface/90 backdrop-blur-md rounded-xl shadow-lg border border-outline-variant/50 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-[20px]">verified</span>
              </div>
              <h3 className="text-label-md text-on-surface font-bold leading-tight">Transparansi Publik</h3>
            </div>
            <p className="text-body-md text-on-surface-variant leading-relaxed">Laporan Anda langsung diteruskan ke dinas terkait. Kami memastikan setiap pengaduan ditangani secara cepat dan profesional.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
