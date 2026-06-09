"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function KelolaUser() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [noTelp, setNoTelp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'super_admin') {
      alert('Akses Ditolak. Hanya Super Admin yang diizinkan.');
      router.push('/admin/dashboard');
    } else {
      setUserData(user);
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      console.error('Network Error:', e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/users', {
        nik,
        nama_lengkap: namaLengkap,
        email,
        password,
        role,
        no_telp: noTelp
      });
      
      alert('User berhasil ditambahkan!');
      setNik(''); setNamaLengkap(''); setEmail(''); setPassword(''); setNoTelp('');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Gagal menambahkan user';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      alert('User berhasil dihapus');
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus user');
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Gagal memperbarui role';
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!userData) return <div className="p-xl text-center bg-surface min-h-screen text-on-surface">Memuat...</div>;

  const filteredUsers = users.filter(u => 
    u.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.nik && u.nik.includes(searchTerm)) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-background text-on-background font-body-md text-body-md overflow-hidden">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant shadow-md flex flex-col py-lg px-md z-20 hidden md:flex">
        {/* Header */}
        <div className="flex items-center gap-md mb-xl px-sm">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">Admin Portal</h1>
            <p className="font-caption text-caption text-on-surface-variant mt-xs">Pemerintah Kota</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-sm">
          <Link href="/admin/dashboard" className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link href="/admin/manajemen-laporan" className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined">assignment</span>
            Daftar Laporan
          </Link>
          <Link href="/admin/kelola-user" className="flex items-center gap-md bg-secondary-container text-on-secondary-container rounded-lg px-md py-sm border-l-4 border-primary font-label-md text-label-md transition-transform duration-150 active:scale-95">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
            Manajemen Petugas
          </Link>
        </nav>

        {/* Footer Links */}
        <div className="mt-auto border-t border-outline-variant pt-md flex flex-col gap-sm">
          <button onClick={handleLogout} className="flex items-center gap-md text-error px-md py-sm hover:bg-error-container/20 rounded-lg transition-colors font-label-md text-label-md w-full">
            <span className="material-symbols-outlined">logout</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col ml-0 md:ml-[280px] h-full overflow-hidden bg-background">
        {/* Top Action Bar */}
        <header className="px-gutter py-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md border-b border-surface-variant bg-surface/50 backdrop-blur-sm z-10 sticky top-0">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Manajemen Petugas</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Kelola data pengguna, hak akses, dan status akun sistem.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-md w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80 group">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-xl pr-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                placeholder="Cari berdasarkan NIK atau Nama..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Add User Action */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-md py-2 rounded-lg flex items-center justify-center gap-sm transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
              Tambah User Baru
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-gutter">
          <div className="max-w-container-max mx-auto">
            {/* Data Table Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low/50">
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Nama Lengkap</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">NIK</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Email</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Role</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant">
                    {filteredUsers.map((u) => {
                      const initials = u.nama_lengkap.substring(0, 2).toUpperCase();
                      const isSuperAdmin = u.role === 'super_admin';
                      const roleBadgeClass = isSuperAdmin 
                        ? 'bg-error-container text-on-error-container' 
                        : u.role === 'admin' 
                          ? 'bg-primary-container text-on-primary-container'
                          : u.role === 'petugas'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-tertiary-container text-on-tertiary-container';

                      return (
                        <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors group">
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-sm">
                              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md">{initials}</div>
                              <span className="font-body-md text-body-md text-on-surface font-semibold">{u.nama_lengkap}</span>
                            </div>
                          </td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">{u.nik || '-'}</td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">{u.email}</td>
                          <td className="px-lg py-md">
                            {isSuperAdmin ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${roleBadgeClass}`}>
                                {u.role.replace('_', ' ').toUpperCase()}
                              </span>
                            ) : (
                              <select 
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                className={`inline-flex items-center px-3 py-1 rounded-full font-caption text-caption font-semibold cursor-pointer outline-none border border-outline-variant pr-8 ${roleBadgeClass}`}
                              >
                                <option value="admin" className="bg-surface text-on-surface">ADMIN</option>
                                <option value="user" className="bg-surface text-on-surface">USER</option>
                              </select>
                            )}
                          </td>
                          <td className="px-lg py-md text-right relative">
                            {u.id !== 'SUP-001' && (
                              <button 
                                onClick={() => handleDeleteUser(u.id, u.nama_lengkap)}
                                className="text-error hover:bg-error-container/20 transition-colors p-sm rounded-full inline-flex items-center"
                                title="Hapus User"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-xl text-center text-on-surface-variant">
                          Tidak ada pengguna yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="px-lg py-sm border-t border-surface-variant flex items-center justify-between bg-surface-container-lowest">
                <span className="font-caption text-caption text-on-surface-variant">Menampilkan {filteredUsers.length} pengguna</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tambah User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-margin-mobile">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="font-headline-md text-headline-md text-on-surface">Tambah User Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-xs rounded-full hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg overflow-y-auto flex-1">
              <form id="addUserForm" onSubmit={handleCreateUser} className="flex flex-col gap-md">
                <div>
                  <label className="text-label-md font-label-md text-on-surface mb-xs block">NIK</label>
                  <input type="text" required value={nik} onChange={e => setNik(e.target.value)} className="w-full p-sm rounded-md border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface mb-xs block">Nama Lengkap</label>
                  <input type="text" required value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} className="w-full p-sm rounded-md border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface mb-xs block">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-sm rounded-md border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface mb-xs block">No Telepon</label>
                  <input type="text" value={noTelp} onChange={e => setNoTelp(e.target.value)} className="w-full p-sm rounded-md border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface mb-xs block">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-sm rounded-md border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-label-md font-label-md text-on-surface mb-xs block">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-sm rounded-md border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface flex justify-end gap-md">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-md py-sm rounded-lg text-on-surface-variant font-label-md hover:bg-surface-variant transition-colors"
                type="button"
              >
                Batal
              </button>
              <button 
                form="addUserForm"
                type="submit" 
                disabled={isSubmitting} 
                className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
