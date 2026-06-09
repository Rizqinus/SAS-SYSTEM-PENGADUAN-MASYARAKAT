"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

interface Laporan {
  id: string;
  judul: string;
  deskripsi: string;
  lokasi_jalan: string;
  tingkat_kerusakan: string;
  status: string;
  foto_url?: string;
  created_at: string;
}

interface Komentar {
  id: string;
  laporan_id: string;
  user_id: string;
  isi_komentar: string;
  nama_user: string;
  role_user: string;
  created_at: string;
}


const DetailLaporanPublicClient: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // States Komentar
  const [komentarList, setKomentarList] = useState<Komentar[]>([]);
  const [newKomentar, setNewKomentar] = useState('');
  const [isSubmittingKomentar, setIsSubmittingKomentar] = useState(false);
  const [komentarError, setKomentarError] = useState('');

  const fetchKomentar = React.useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/laporan/${id}/komentar`);
      if (response.ok) {
        const data = await response.json();
        setKomentarList(data);
      }
    } catch (error) {
      console.error('Error fetching komentar:', error);
    }
  }, [id]);

  const fetchDetail = React.useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/laporan/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLaporan(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
    fetchDetail();
    fetchKomentar();
  }, [fetchDetail, fetchKomentar]);

  const handlePostKomentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKomentar.trim() || !id) return;
    setIsSubmittingKomentar(true);
    setKomentarError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/laporan/${id}/komentar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isi_komentar: newKomentar }),
      });

      const result = await response.json();

      if (response.ok) {
        setNewKomentar('');
        fetchKomentar();
      } else {
        setKomentarError(result.message || 'Gagal menambahkan komentar.');
      }
    } catch (error) {
      setKomentarError('Terjadi kesalahan saat mengirim komentar.');
    } finally {
      setIsSubmittingKomentar(false);
    }
  };

  const handleDeleteKomentar = async (commentId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/laporan/${id}/komentar/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        fetchKomentar();
      } else {
        alert(result.message || 'Gagal menghapus komentar.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Terjadi kesalahan saat menghapus komentar.');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  if (!laporan) return null;

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'menunggu': return { label: 'Menunggu Verifikasi', color: 'text-on-surface-variant', bg: 'bg-surface-container' };
      case 'approved':
      case 'diverifikasi': return { label: 'Diverifikasi', color: 'text-blue-700', bg: 'bg-blue-100' };
      case 'in_progress':
      case 'proses': return { label: 'Sedang Diperbaiki', color: 'text-amber-700', bg: 'bg-amber-100' };
      case 'resolved':
      case 'selesai': return { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-100' };
      case 'rejected':
      case 'ditolak': return { label: 'Ditolak', color: 'text-error border-error-variant', bg: 'bg-error-container/20' };
      default: return { label: status, color: 'text-on-surface', bg: 'bg-surface-variant' };
    }
  };

  const getPriorityDisplay = (tingkat: string) => {
    switch (tingkat?.toLowerCase()) {
      case 'berat': return { label: 'Prioritas Tinggi', style: 'bg-error-container/20 text-error border-error-variant' };
      case 'sedang': return { label: 'Prioritas Sedang', style: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'ringan': return { label: 'Prioritas Rendah', style: 'bg-blue-100 text-blue-700 border-blue-200' };
      default: return { label: tingkat || 'Sedang', style: 'bg-surface-variant text-on-surface-variant' };
    }
  };

  const getTimelineSteps = (currentStatus: string) => {
    const status = currentStatus.toLowerCase();
    
    if (status === 'rejected' || status === 'ditolak') {
      return [
        {
          title: 'Laporan Diterima',
          desc: 'Laporan telah masuk ke sistem kami.',
          completed: true,
          active: false,
          isRejected: false
        },
        {
          title: 'Laporan Ditolak',
          desc: 'Maaf, laporan Anda ditolak karena tidak memenuhi kriteria.',
          completed: true,
          active: true,
          isRejected: true
        }
      ];
    }
    
    let currentLevel = 0;
    if (status === 'approved' || status === 'diverifikasi') currentLevel = 1;
    else if (status === 'in_progress' || status === 'proses') currentLevel = 2;
    else if (status === 'resolved' || status === 'selesai') currentLevel = 3;

    return [
      {
        title: 'Laporan Diterima',
        desc: 'Laporan telah masuk ke sistem kami.',
        completed: currentLevel >= 0,
        active: currentLevel === 0,
        isRejected: false
      },
      {
        title: 'Sedang Diverifikasi',
        desc: 'Petugas sedang meninjau kelengkapan laporan.',
        completed: currentLevel >= 1,
        active: currentLevel === 1,
        isRejected: false
      },
      {
        title: 'Dalam Pengerjaan',
        desc: 'Menunggu jadwal tim teknis.',
        completed: currentLevel >= 2,
        active: currentLevel === 2,
        isRejected: false
      },
      {
        title: 'Selesai Diperbaiki',
        desc: 'Infrastruktur jalan telah diperbaiki.',
        completed: currentLevel >= 3,
        active: currentLevel === 3,
        isRejected: false
      }
    ];
  };

  const statusInfo = getStatusDisplay(laporan.status);
  const priorityInfo = getPriorityDisplay(laporan.tingkat_kerusakan);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <PublicNavbar isLoggedIn={!!userData} userName={userData?.nama_lengkap} />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        {/* Breadcrumb */}
        <div className="mb-lg">
          <div className="flex items-center gap-sm text-on-surface-variant mb-md">
            <span className="text-caption hover:text-primary transition-colors">Laporan</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-caption font-semibold">Detail Laporan #{laporan.id}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-md">
            <div>
              <h1 className="text-headline-lg text-on-surface mb-sm">{laporan.judul}</h1>
              <div className="flex flex-wrap items-center gap-md text-body-md text-on-surface-variant">
                <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[20px]">calendar_today</span>{new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[20px]">location_on</span>{laporan.lokasi_jalan}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-sm mt-xs">
              <div className={`flex items-center gap-xs ${priorityInfo.style} px-md py-xs rounded-lg border font-bold text-label-md`}>
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {priorityInfo.label}
              </div>
              <div className={`flex items-center gap-xs ${statusInfo.bg} ${statusInfo.color} px-md py-xs rounded-full font-bold border`}>
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span className="text-label-sm uppercase">{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mt-xl">
          {/* Left */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <div className="unboxed-card overflow-hidden">
              <div className="w-full aspect-[16/9] relative bg-surface-variant">
                {laporan.foto_url ? (
                  <img alt="Bukti Laporan" className="w-full h-full object-cover" src={`http://localhost:5000${laporan.foto_url}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[64px]">image_not_supported</span>
                  </div>
                )}
                <div className="absolute bottom-md right-md bg-surface/90 backdrop-blur-sm px-sm py-xs rounded flex items-center gap-xs text-on-surface shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span className="text-caption">Foto Pengadu</span>
                </div>
              </div>
              <div className="p-lg">
                <h3 className="text-headline-md text-on-surface mb-sm">Deskripsi Laporan</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{laporan.deskripsi}</p>
              </div>
            </div>

            {/* Kartu Komentar */}
            <div className="unboxed-card p-lg flex flex-col gap-lg">
              <h3 className="text-headline-md text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">chat_bubble</span>
                Komentar ({komentarList.length})
              </h3>
              
              {/* List Komentar */}
              <div className="flex flex-col gap-md max-h-[400px] overflow-y-auto pr-xs">
                {komentarList.length === 0 ? (
                  <p className="text-body-md text-on-surface-variant italic">Belum ada komentar untuk laporan ini.</p>
                ) : (
                  komentarList.map((comment) => (
                    <div key={comment.id} className="flex gap-md border-b border-outline-variant/30 pb-md last:border-none last:pb-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-body-lg flex-shrink-0">
                        {comment.nama_user?.substring(0, 2).toUpperCase() || 'AN'}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-grow flex flex-col">
                        <div className="flex items-center justify-between gap-sm mb-xs">
                          <div className="flex items-center gap-sm flex-wrap">
                            <span className="font-semibold text-body-md text-on-surface">{comment.nama_user}</span>
                            {comment.role_user !== 'user' && (
                              <span className={`px-xs py-[2px] rounded text-caption font-bold capitalize 
                                ${comment.role_user === 'super_admin' 
                                  ? 'bg-error-container text-on-error-container' 
                                  : 'bg-primary-container text-on-primary-container'}`}
                              >
                                {comment.role_user === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            )}
                          </div>
                          <span className="text-caption text-outline">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">{comment.isi_komentar}</p>
                      </div>

                      {/* Delete Action */}
                      {(userData?.id === comment.user_id || userData?.role === 'admin' || userData?.role === 'super_admin') && (
                        <button 
                          onClick={() => handleDeleteKomentar(comment.id)}
                          className="text-error hover:bg-error/10 p-xs rounded transition-colors self-start"
                          title="Hapus Komentar"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Form Tambah Komentar */}
              <div className="border-t border-outline-variant/50 pt-lg">
                {userData ? (
                  <form onSubmit={handlePostKomentar} className="flex flex-col gap-md">
                    {komentarError && (
                      <div className="p-xs bg-error-container text-on-error-container rounded border border-error/50 text-caption flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        {komentarError}
                      </div>
                    )}
                    <div className="flex gap-md items-start">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-body-lg flex-shrink-0">
                        {userData.nama_lengkap?.substring(0, 2).toUpperCase() || 'ME'}
                      </div>
                      <div className="flex-grow">
                        <textarea
                          rows={3}
                          value={newKomentar}
                          onChange={(e) => setNewKomentar(e.target.value)}
                          placeholder="Tulis tanggapan atau pertanyaan mengenai laporan ini..."
                          className="w-full rounded-[12px] border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors placeholder:text-outline"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingKomentar || !newKomentar.trim()}
                        className="px-lg py-sm rounded-full bg-primary text-on-primary font-semibold text-label-md hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs shadow-sm"
                      >
                        {isSubmittingKomentar ? 'Mengirim...' : 'Kirim Komentar'}
                        {!isSubmittingKomentar && <span className="material-symbols-outlined text-[16px]">send</span>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-surface-container-low p-md rounded-[12px] text-center border border-outline-variant/30">
                    <p className="text-body-md text-on-surface-variant mb-sm">Anda harus masuk (login) untuk mengirimkan komentar.</p>
                    <Link 
                      href="/login" 
                      className="inline-block px-lg py-xs rounded-full bg-primary text-on-primary font-semibold text-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
                    >
                      Login Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Right */}
          <div className="lg:col-span-4 flex flex-col gap-lg">
            <div className="unboxed-card p-lg">
              <h3 className="text-headline-md text-on-surface mb-lg">Status Penanganan</h3>
              <div className="relative pl-sm">
                <div className="absolute left-[15px] top-4 bottom-8 w-[2px] bg-outline-variant"></div>
                {getTimelineSteps(laporan.status).map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-md mb-xl last:mb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 mt-1 flex-shrink-0 border-2 transition-colors duration-300
                      ${step.isRejected
                        ? 'bg-error border-error text-on-error'
                        : step.completed 
                          ? 'bg-primary border-primary text-on-primary' 
                          : step.active 
                            ? 'bg-primary-container border-primary text-primary animate-pulse' 
                            : 'bg-surface border-outline-variant text-outline'}`}
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">
                        {step.isRejected ? 'close' : step.completed ? 'check' : 'circle'}
                      </span>
                    </div>
                    <div>
                      <h4 className={`text-label-md font-bold ${step.completed || step.active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.title}</h4>
                      <p className="text-caption text-on-surface-variant mt-xs">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default DetailLaporanPublicClient;
