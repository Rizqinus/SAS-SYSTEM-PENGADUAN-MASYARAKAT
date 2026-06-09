"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
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
        console.error('Error parsing user on Register mount:', e);
      }
    }
  }, [router]);

  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }
    if (!formData.terms) {
      setErrorMsg('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik: formData.nik,
          nama_lengkap: formData.fullName,
          email: formData.email,
          password: formData.password,
          no_telp: formData.phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Tampilkan Peringatan Keberhasilan (Alert)
        alert('Pendaftaran Berhasil!\nAkun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.');
        
        // Arahkan ke halaman login
        router.push('/login');
      } else {
        setErrorMsg(data.message || 'Gagal mendaftar. Silakan periksa data Anda.');
      }
    } catch (err) {
      setErrorMsg('Tidak dapat terhubung ke server. Pastikan backend sudah menyala.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col text-body-md text-on-background">
      <main className="flex-grow flex items-center justify-center p-gutter relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant w-full max-w-2xl relative z-10 overflow-hidden">
          {/* Header Section */}
          <div className="bg-surface-container px-xl py-lg border-b border-outline-variant text-center">
            <h1 className="text-headline-lg text-primary">Daftar Akun</h1>
            <p className="text-body-md text-on-surface-variant mt-sm">Sistem Pengaduan Infrastruktur Jalan</p>
          </div>
          {/* Form Section */}
          <form className="p-xl flex flex-col gap-md" onSubmit={handleSubmit}>
            
            {/* Tampilkan pesan error jika ada */}
            {errorMsg && (
              <div className="p-sm bg-error-container text-on-error-container rounded-lg border border-error/50 flex items-center gap-sm text-body-md">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {errorMsg}
              </div>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface" htmlFor="fullName">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                </div>
                <input 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-body-md text-on-surface font-medium" 
                  id="fullName" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama lengkap Anda" 
                  type="text" 
                />
              </div>
            </div>
            {/* NIK */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface" htmlFor="nik">Nomor Induk Kependudukan (NIK)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">badge</span>
                </div>
                <input 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-body-md text-on-surface font-medium" 
                  id="nik" 
                  value={formData.nik}
                  onChange={handleChange}
                  required
                  placeholder="16 Digit NIK" 
                  type="text" 
                />
              </div>
            </div>
            {/* Email & Phone (Grid for Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Email */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-body-md text-on-surface font-medium" 
                    id="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="nama@email.com" 
                    type="email" 
                  />
                </div>
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface" htmlFor="phone">Nomor Telepon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">call</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-body-md text-on-surface font-medium" 
                    id="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="08xx xxxx xxxx" 
                    type="tel" 
                  />
                </div>
              </div>
            </div>
            {/* Password */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface" htmlFor="password">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                </div>
                <input 
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-body-md text-on-surface font-medium" 
                  id="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimal 8 karakter" 
                  type="password" 
                />
              </div>
            </div>
            {/* Confirm Password */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface" htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock_reset</span>
                </div>
                <input 
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-body-md text-on-surface font-medium" 
                  id="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Ulangi kata sandi" 
                  type="password" 
                />
              </div>
            </div>
            {/* Terms and Conditions */}
            <div className="flex items-start gap-sm mt-xs">
              <div className="flex items-center h-5">
                <input 
                  className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant rounded focus:ring-primary focus:ring-2 mt-0.5 cursor-pointer" 
                  id="terms" 
                  checked={formData.terms}
                  onChange={handleChange}
                  type="checkbox" 
                />
              </div>
              <label className="text-caption text-on-surface-variant leading-tight cursor-pointer font-medium" htmlFor="terms">
                Saya menyetujui <a className="text-primary hover:underline font-semibold" href="#">Syarat & Ketentuan</a> serta <a className="text-primary hover:underline font-semibold" href="#">Kebijakan Privasi</a> yang berlaku untuk layanan ini.
              </label>
            </div>
            {/* Submit Button */}
            <button 
              disabled={isLoading}
              className={`w-full mt-sm py-sm px-lg bg-primary text-on-primary rounded-lg text-label-md hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-sm font-bold ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
              type="submit"
            >
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
            {/* Login Link */}
            <div className="mt-sm text-center">
              <p className="text-body-md text-on-surface-variant">
                Sudah punya akun? <Link className="text-primary font-bold hover:underline" href="/login">Masuk di sini</Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
