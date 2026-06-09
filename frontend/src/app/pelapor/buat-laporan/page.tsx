"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicNavbar from '../../../components/PublicNavbar';
import PublicFooter from '../../../components/PublicFooter';
import api from '@/utils/api';

export default function BuatLaporan() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    judul: '',
    category_id: '',
    deskripsi: '',
    lokasi_jalan: '',
    tingkat_kerusakan: 'sedang',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    }
  }, [router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Gagal mengambil kategori:', error);
      }
    };
    fetchCategories();
  }, []);

  // Clean up preview URL memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('judul', formData.judul);
      data.append('category_id', formData.category_id);
      data.append('deskripsi', formData.deskripsi);
      data.append('lokasi_jalan', formData.lokasi_jalan);
      data.append('tingkat_kerusakan', formData.tingkat_kerusakan);
      if (foto) {
        data.append('foto', foto);
      }

      await api.post('/laporan', data);

      alert('Laporan berhasil dibuat!');
      router.push('/pelapor/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Terjadi kesalahan saat mengirim laporan.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="text-on-background antialiased flex flex-col min-h-screen bg-background">
      <PublicNavbar isLoggedIn userName={userData.nama_lengkap} userAvatar={userData.avatar_url} />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-gutter py-xl">
        <div className="max-w-3xl mx-auto">
          <div className="mb-xl text-center">
            <h1 className="text-headline-lg text-primary mb-sm">Buat Laporan Baru</h1>
            <p className="text-body-lg text-on-surface-variant">Sampaikan detail kerusakan infrastruktur yang Anda temukan agar kami dapat segera menindaklanjutinya.</p>
          </div>
          <div className="unboxed-card p-xl">
            {errorMsg && (
              <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg border border-error/50 flex items-center gap-sm text-body-md">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {errorMsg}
              </div>
            )}
            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="space-y-xs">
                <label className="block text-label-md text-on-surface" htmlFor="judul">Judul Laporan</label>
                <input 
                  className="w-full rounded-[12px] border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline outline-none" 
                  id="judul" 
                  value={formData.judul}
                  onChange={handleChange}
                  placeholder="Singkat dan jelas, misal: Jalan Berlubang di Sudirman" 
                  required
                  type="text" 
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-label-md text-on-surface" htmlFor="category_id">Kategori Laporan</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-[12px] border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    id="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Pilih Kategori Laporan --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="block text-label-md text-on-surface" htmlFor="tingkat_kerusakan">Tingkat Kerusakan</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-[12px] border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    id="tingkat_kerusakan"
                    value={formData.tingkat_kerusakan}
                    onChange={handleChange}
                  >
                    <option value="ringan">Ringan</option>
                    <option value="sedang">Sedang</option>
                    <option value="berat">Berat</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="block text-label-md text-on-surface" htmlFor="lokasi_jalan">Lokasi / Nama Jalan</label>
                <input 
                  className="w-full rounded-[12px] border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-outline outline-none" 
                  id="lokasi_jalan" 
                  value={formData.lokasi_jalan}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Asia Afrika No. 12, Bandung" 
                  required
                  type="text" 
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-label-md text-on-surface" htmlFor="deskripsi">Deskripsi Detail</label>
                <textarea 
                  className="w-full rounded-[12px] border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline resize-none outline-none" 
                  id="deskripsi" 
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Jelaskan kondisi kerusakan..." 
                  required
                  rows={4}
                ></textarea>
              </div>
              <div className="space-y-xs">
                <label className="block text-label-md text-on-surface">Foto Bukti (Opsional namun disarankan)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-outline-variant rounded-[12px] bg-surface-container-low p-xl text-center hover:bg-surface-container transition-colors flex flex-col items-center justify-center gap-sm">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg mb-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-sm">
                        <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                      </div>
                    )}
                    <p className="text-body-md text-on-surface-variant">
                      <span className="font-bold text-primary">{previewUrl ? 'Ganti Foto' : 'Klik untuk unggah'}</span> atau seret dan lepas gambar ke sini
                    </p>
                    <p className="text-caption text-outline">Mendukung JPG, PNG, max 5MB</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-md border-t border-outline-variant flex justify-end gap-md">
                <button 
                  className="px-xl py-sm rounded-[12px] text-on-surface-variant text-label-md hover:bg-surface-container-high transition-colors" 
                  type="button"
                  onClick={() => router.push('/pelapor/dashboard')}
                >
                  Batal
                </button>
                <button 
                  className="px-xl py-sm rounded-[12px] bg-primary text-on-primary text-label-md hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-xs shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'} 
                  {!isSubmitting && <span className="material-symbols-outlined text-[18px]">send</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
