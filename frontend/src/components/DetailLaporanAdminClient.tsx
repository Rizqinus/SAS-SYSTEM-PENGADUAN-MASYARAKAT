"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function DetailLaporanAdminClient() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [laporan, setLaporan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // States Komentar
  const [komentarList, setKomentarList] = useState<any[]>([]);
  const [newKomentar, setNewKomentar] = useState('');
  const [isSubmittingKomentar, setIsSubmittingKomentar] = useState(false);
  const [komentarError, setKomentarError] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/');
    } else {
      setUserData(user);
    }
  }, [router]);

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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/laporan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLaporan(data);
        setStatus(data.status || 'pending');
      } else {
        router.push('/admin/manajemen-laporan');
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
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

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/laporan/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert('Status berhasil diperbarui!');
        fetchDetail();
      } else {
        alert('Gagal memperbarui status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (isLoading || !userData) return <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">Memuat...</div>;
  if (!laporan) return null;

  const getPriorityDisplay = (tingkat: string) => {
    switch (tingkat?.toLowerCase()) {
      case 'berat': return { label: 'Mendesak', style: 'bg-error-container text-on-error-container font-bold', icon: 'warning' };
      case 'sedang': return { label: 'Sedang', style: 'bg-status-processing/10 text-[#8B6A1A] font-bold', icon: 'info' };
      case 'ringan': return { label: 'Rendah', style: 'bg-blue-100 text-blue-700 font-bold', icon: 'info' };
      default: return { label: tingkat || 'Normal', style: 'bg-surface-variant text-on-surface-variant', icon: 'info' };
    }
  };

  const getTimelineSteps = (currentStatus: string) => {
    const statusVal = currentStatus.toLowerCase();
    
    if (statusVal === 'rejected' || statusVal === 'ditolak') {
      return [
        {
          title: 'Dilaporkan',
          desc: `Oleh ${laporan.nama_pelapor || 'Sistem'}`,
          completed: true,
          active: false,
          isRejected: false
        },
        {
          title: 'Laporan Ditolak',
          desc: 'Pengaduan ini ditolak karena tidak valid / tidak sesuai kriteria.',
          completed: true,
          active: true,
          isRejected: true
        }
      ];
    }
    
    let currentLevel = 0;
    if (statusVal === 'approved' || statusVal === 'diverifikasi') currentLevel = 1;
    else if (statusVal === 'in_progress' || statusVal === 'proses') currentLevel = 2;
    else if (statusVal === 'resolved' || statusVal === 'selesai') currentLevel = 3;

    return [
      {
        title: 'Dilaporkan',
        desc: `Oleh ${laporan.nama_pelapor || 'Sistem'}`,
        completed: currentLevel >= 0,
        active: currentLevel === 0,
        isRejected: false
      },
      {
        title: 'Diverifikasi',
        desc: 'Laporan valid, diteruskan ke tim teknis.',
        completed: currentLevel >= 1,
        active: currentLevel === 1,
        isRejected: false
      },
      {
        title: 'Sedang Diproses',
        desc: 'Menunggu jadwal tim teknis / material disiapkan.',
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

  const priorityInfo = getPriorityDisplay(laporan.tingkat_kerusakan);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased flex min-h-screen">
      {/* SideNavBar Component */}
      <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant shadow-md flex flex-col py-lg px-md z-50 hidden md:flex">
        <div className="mb-xl px-sm">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Admin Portal</h1>
          <p className="font-caption text-caption text-on-surface-variant">Pemerintah Kota</p>
        </div>
        <div className="flex flex-col gap-sm flex-1 mt-lg">
          <Link className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md" href="/admin/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link className="flex items-center gap-md bg-secondary-container text-on-secondary-container rounded-lg px-md py-sm border-l-4 border-primary font-label-md text-label-md" href="/admin/manajemen-laporan">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
            Daftar Laporan
          </Link>
          {userData.role === 'super_admin' && (
            <Link className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md" href="/admin/kelola-user">
              <span className="material-symbols-outlined">manage_accounts</span>
              Kelola User
            </Link>
          )}
        </div>
        <div className="mt-auto flex flex-col gap-sm border-t border-outline-variant pt-md">
          <button onClick={handleLogout} className="flex items-center gap-md text-error px-md py-sm hover:bg-error-container/20 rounded-lg transition-colors font-label-md text-label-md w-full">
            <span className="material-symbols-outlined">logout</span>
            Keluar
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[280px] p-margin-mobile md:p-margin-desktop w-full max-w-container-max flex flex-col gap-lg bg-background min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col gap-sm mt-md">
          <div className="flex items-center text-on-surface-variant font-caption text-caption gap-xs">
            <Link className="hover:text-primary transition-colors" href="/admin/manajemen-laporan">Daftar Laporan</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-semibold">#{laporan.id.split('-').pop()}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{laporan.judul}</h2>
              <span className={`${priorityInfo.style} font-label-md text-label-md px-sm py-xs rounded-full flex items-center gap-xs`}>
                <span className="material-symbols-outlined text-[16px]">{priorityInfo.icon}</span>
                {priorityInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <button onClick={() => window.print()} className="p-sm text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined">print</span>
                <span className="font-label-md text-label-md hidden md:inline">Cetak</span>
              </button>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Primary Details */}
          <div className="lg:col-span-8 flex flex-col gap-gutter">
            {/* Images Card */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden p-md">
              <div className="w-full h-[400px] rounded-lg overflow-hidden bg-surface-variant relative mb-sm">
                {laporan.foto_url ? (
                  <img alt={laporan.judul} className="w-full h-full object-cover" src={`http://localhost:5000${laporan.foto_url}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[64px]">image_not_supported</span>
                  </div>
                )}
              </div>
            </section>

            {/* Detailed Information Card */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col gap-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface">Detail Informasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="flex flex-col gap-sm">
                  <p className="font-label-md text-label-md text-on-surface-variant">Deskripsi Laporan</p>
                  <p className="font-body-md text-body-md text-on-surface">{laporan.deskripsi}</p>
                </div>
                <div className="flex flex-col gap-sm border-l md:border-outline-variant md:pl-lg">
                  <p className="font-label-md text-label-md text-on-surface-variant">Informasi Pelapor</p>
                  <div className="flex items-center gap-md mt-xs">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold font-body-lg">
                      {laporan.nama_pelapor?.substring(0,2).toUpperCase() || 'AN'}
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-semibold">{laporan.nama_pelapor || 'Anonim'}</p>
                    </div>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Dilaporkan: {formatDate(laporan.created_at)}
                  </p>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-lg mt-sm flex flex-col gap-md">
                <p className="font-label-md text-label-md text-on-surface-variant">Lokasi Kejadian</p>
                <p className="font-body-md text-body-md text-on-surface">{laporan.lokasi_jalan}</p>
              </div>
            </section>

            {/* Comments Card for Admin Panel */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col gap-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">chat_bubble</span>
                Komentar / Tanggapan ({komentarList.length})
              </h3>
              
              {/* List Komentar */}
              <div className="flex flex-col gap-md max-h-[300px] overflow-y-auto pr-xs">
                {komentarList.length === 0 ? (
                  <p className="font-body-md text-on-surface-variant italic">Belum ada komentar untuk laporan ini.</p>
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
                            <span className={`px-xs py-[2px] rounded text-caption font-bold capitalize 
                              ${comment.role_user === 'super_admin' 
                                ? 'bg-error-container text-on-error-container' 
                                : comment.role_user === 'admin' 
                                  ? 'bg-primary-container text-on-primary-container' 
                                  : 'bg-surface-container-high text-on-surface-variant'}`}
                            >
                              {comment.role_user === 'super_admin' ? 'Super Admin' : comment.role_user === 'admin' ? 'Admin' : 'Pelapor'}
                            </span>
                          </div>
                          <span className="text-caption text-outline">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">{comment.isi_komentar}</p>
                      </div>

                      {/* Delete Action (Admins can delete any comment) */}
                      <button 
                        onClick={() => handleDeleteKomentar(comment.id)}
                        className="text-error hover:bg-error/10 p-xs rounded transition-colors self-start"
                        title="Hapus Komentar"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form Tambah Komentar */}
              <div className="border-t border-outline-variant/50 pt-lg">
                <form onSubmit={handlePostKomentar} className="flex flex-col gap-md">
                  {komentarError && (
                    <div className="p-xs bg-error-container text-on-error-container rounded border border-error/50 text-caption flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      {komentarError}
                    </div>
                  )}
                  <div className="flex gap-md items-start">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-body-lg flex-shrink-0">
                      {userData.nama_lengkap?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="flex-grow">
                      <textarea
                        rows={3}
                        value={newKomentar}
                        onChange={(e) => setNewKomentar(e.target.value)}
                        placeholder="Berikan tanggapan resmi atau komentar untuk warga..."
                        className="w-full rounded-[12px] border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors placeholder:text-outline"
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
                      {isSubmittingKomentar ? 'Mengirim...' : 'Kirim Tanggapan'}
                      {!isSubmittingKomentar && <span className="material-symbols-outlined text-[16px]">send</span>}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>

          {/* Right Column: Action & Status */}
          <div className="lg:col-span-4 flex flex-col gap-gutter">
            {/* Action Panel */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col gap-md">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">update</span>
                Perbarui Status
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-sm">Ubah status penanganan laporan ini untuk memberikan update kepada publik.</p>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Status Baru</label>
                <select 
                  className="w-full border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Menunggu Verifikasi</option>
                  <option value="approved">Diverifikasi</option>
                  <option value="in_progress">Sedang Diproses</option>
                  <option value="resolved">Selesai Diperbaiki</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
              <button 
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="mt-md w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-full hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </section>

            {/* Status Timeline */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Riwayat Status</h3>
              <div className="relative pl-md border-l-2 border-outline-variant ml-sm flex flex-col gap-lg">
                {getTimelineSteps(laporan.status).map((step, idx) => {
                  if (!step.completed && !step.active) return null; // Only show reached steps
                  return (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full ring-4 ring-surface-container-lowest 
                        ${step.isRejected ? 'bg-error' : step.active ? 'bg-primary' : 'bg-outline'}`}
                      ></div>
                      <h4 className={`font-label-md text-label-md ${step.isRejected ? 'text-error font-bold' : step.active ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>{step.title}</h4>
                      <p className="font-caption text-caption text-on-surface-variant">{step.desc}</p>
                    </div>
                  );
                }).reverse()}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
