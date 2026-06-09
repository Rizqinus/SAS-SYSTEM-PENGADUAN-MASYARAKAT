"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

export default function ProsesPengaduanPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token) {
      setIsLoggedIn(true);
      setUserName(user.nama_lengkap || '');
    }
  }, []);

  const steps = [
    {
      title: 'Kirim Laporan',
      description: 'Warga melaporkan kerusakan infrastruktur melalui portal web dengan menyertakan foto dan lokasi koordinat.',
      icon: 'add_a_photo',
      color: 'bg-primary-container text-on-primary-container',
      line: 'bg-primary',
    },
    {
      title: 'Verifikasi Laporan',
      description: 'Tim admin memverifikasi keabsahan laporan, mengecek duplikasi, dan menentukan tingkat urgensi.',
      icon: 'fact_check',
      color: 'bg-secondary-container text-on-secondary-container',
      line: 'bg-secondary',
    },
    {
      title: 'Tindak Lanjut & Survei',
      description: 'Dinas PU mengirimkan tim teknis ke lapangan untuk melakukan survei dan perhitungan estimasi perbaikan.',
      icon: 'engineering',
      color: 'bg-tertiary-container text-on-tertiary-container',
      line: 'bg-tertiary',
    },
    {
      title: 'Proses Perbaikan',
      description: 'Kontraktor atau tim Bina Marga melaksanakan perbaikan jalan sesuai standar operasional yang berlaku.',
      icon: 'construction',
      color: 'bg-error-container text-on-error-container',
      line: 'bg-error',
    },
    {
      title: 'Laporan Selesai',
      description: 'Perbaikan selesai dilakukan. Warga akan menerima notifikasi bahwa laporan telah berhasil ditutup.',
      icon: 'check_circle',
      color: 'bg-success-container text-on-success-container',
      line: 'bg-transparent',
    },
  ];

  return (
    <div className="text-on-surface bg-background min-h-screen flex flex-col antialiased">
      <PublicNavbar isLoggedIn={isLoggedIn} userName={userName} />

      <main className="max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex-grow w-full">
        <section className="text-center mb-xl">
          <h1 className="text-display-sm text-primary mb-sm font-bold">Alur & Proses Pengaduan</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Kami berkomitmen untuk memberikan transparansi penuh. Berikut adalah tahapan yang dilalui setiap laporan sejak dikirim hingga selesai diperbaiki.
          </p>
        </section>

        <section className="relative px-sm">
          {/* Timeline Container */}
          <div className="space-y-lg">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-md md:gap-xl relative">
                {/* Vertical Line Connection */}
                {index !== steps.length - 1 && (
                  <div className={`absolute left-6 top-14 bottom-[-2rem] w-1 ${step.line} opacity-30 rounded-full md:left-10`}></div>
                )}
                
                {/* Icon */}
                <div className={`w-12 h-12 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center z-10 shadow-sm border-4 border-surface ${step.color}`}>
                  <span className="material-symbols-outlined text-[24px] md:text-[36px]">{step.icon}</span>
                </div>
                
                {/* Content Card */}
                <div className="flex-1 bg-surface-container-lowest p-md md:p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                  <h3 className="text-headline-sm font-bold text-on-surface mb-xs">
                    <span className="text-outline-variant mr-sm">0{index + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-2xl text-center p-xl bg-primary-container rounded-2xl border border-primary/20">
          <h2 className="text-headline-md text-on-primary-container font-bold mb-sm">Siap Membantu Kota Anda?</h2>
          <p className="text-body-md text-on-primary-container/80 mb-lg">Laporan Anda sangat berharga untuk keselamatan ribuan pengguna jalan lainnya.</p>
          <Link href="/pelapor/buat-laporan" className="inline-block bg-primary text-on-primary px-xl py-md rounded-full text-label-lg font-bold shadow-md hover:opacity-90 transition-opacity">
            Buat Laporan Sekarang
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
