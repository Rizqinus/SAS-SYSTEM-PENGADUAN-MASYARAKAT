import React from 'react';
import Link from 'next/link';

const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-surface-container-highest w-full rounded-t-xl border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter py-lg w-full max-w-[1440px] mx-auto gap-md">
        <div className="flex flex-col md:flex-row items-center gap-sm text-center md:text-left">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_road</span>
            <span className="text-headline-md font-bold text-on-surface">SPIJ</span>
          </div>
          <span className="hidden md:inline text-outline-variant">|</span>
          <p className="text-caption text-on-surface-variant">
            © 2024 Sistem Pengaduan Infrastruktur Jalan (SPIJ). Layanan Publik Digital Terpercaya.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-md">
          <Link className="text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">Kebijakan Privasi</Link>
          <Link className="text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">Panduan Pengguna</Link>
          <Link className="text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">Kontak Darurat</Link>
          <Link className="text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">Peta Situs</Link>
        </nav>
      </div>
    </footer>
  );
};

export default PublicFooter;
