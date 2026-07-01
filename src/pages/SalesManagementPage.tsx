import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Upload, Download, FileText, ArrowLeft, Search, User, Save, ChevronLeft, ChevronRight, Trash2, Eye, Edit } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import {
  fetchTargets,
  fetchRealizations,
  saveTargets,
  saveRealizations,
  deleteTarget,
  deleteRealization,
  updateTarget,
  updateRealization,
  importTargetsExcel,
  importRealizationsExcel,
  fetchMasterList,
  saveMasterData,
  updateMasterData,
  deleteMasterData,
  fetchMasterData,
  type MasterData,
} from "@/api/sales";
import { apiUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";

export default function SalesManagementPage() {
  const [master, setMaster] = useState<MasterData | null>(null);
  const [activeTab, setActiveTab] = useState<"target" | "realisasi">("target");
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: () => {} });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modals
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilter, setExportFilter] = useState({
    start_year: new Date().getFullYear() - 1,
    start_month: 1,
    end_year: new Date().getFullYear(),
    end_month: new Date().getMonth() + 1,
  });
  
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const createEmptySalesDraft = () => ({ year: currentYear, month: currentMonth, sales_member_name: '', entity_name: '', end_user_name: '', amount: '' });
  const [drafts, setDrafts] = useState<any[]>([createEmptySalesDraft()]);

  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);

  // Master Modals
  const [masterType, setMasterType] = useState<string | null>(null);
  const [masterList, setMasterList] = useState<any[]>([]);
  const [masterCurrentPage, setMasterCurrentPage] = useState(1);
  const [masterLastPage, setMasterLastPage] = useState(1);
  const [masterLoading, setMasterLoading] = useState(false);
  const [editingMasterId, setEditingMasterId] = useState<number | null>(null);
  const [editMasterName, setEditMasterName] = useState("");
  const [editMasterCode, setEditMasterCode] = useState("");
  const [editMasterStatus, setEditMasterStatus] = useState<number>(1);
  const [newMasterName, setNewMasterName] = useState("");
  const [newMasterCode, setNewMasterCode] = useState("");
  const [newMasterStatus, setNewMasterStatus] = useState<number>(1);
  const [editMasterTeamId, setEditMasterTeamId] = useState<number | "">("");
  const [newMasterTeamId, setNewMasterTeamId] = useState<number | "">("");
  const [teamList, setTeamList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMasterModalOpen, setIsAddMasterModalOpen] = useState(false);
  const [isEditMasterModalOpen, setIsEditMasterModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMaster = async () => {
    try {
      const res = await fetchMasterData();
      setMaster(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadList = async (page: number = 1) => {
    setLoading(true);
    try {
      if (activeTab === "target") {
        const res = await fetchTargets(page);
        setData(res.data);
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
      } else {
        const res = await fetchRealizations(page);
        setData(res.data);
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaster();
  }, []);

  useEffect(() => {
    loadList(1);
    // eslint-disable-next-line
  }, [activeTab]);

  const handleDelete = (id: number) => {
    showConfirm("Yakin hapus data ini?", async () => {
      try {
        if (activeTab === "target") await deleteTarget(id);
        else await deleteRealization(id);
        loadList();
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    });
  };

  const processUploadFile = async (file: File) => {
    setUploading(true);
    try {
      if (activeTab === "target") {
        await importTargetsExcel(file);
      } else {
        await importRealizationsExcel(file);
      }
      toast.success("Import berhasil!");
      setIsImportModalOpen(false);
      setSelectedFile(null);
      loadList();
    } catch (err: any) {
      toast.error(err.message || "Gagal import Excel");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        setSelectedFile(file);
      } else {
        toast.error("Format file tidak didukung. Harap gunakan Excel atau CSV.");
      }
    }
  };

  const openAddModal = () => {
    setDrafts([createEmptySalesDraft()]);
    setCurrentDraftIndex(0);
    setModalMode('add');
  };

  const openActionModal = (item: any, mode: 'edit' | 'detail') => {
    setDrafts([{
      id: item.id,
      year: item.year,
      month: item.month,
      sales_member_name: item.sales_member?.name || item.sales_member_name || '',
      entity_name: item.entity?.name || item.entity_name || '',
      end_user_name: item.end_user?.name || item.end_user_name || '',
      amount: item.target_amount || item.realization_amount || ''
    }]);
    setCurrentDraftIndex(0);
    setModalMode(mode);
  };

  const handleSaveDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (modalMode === 'edit') {
        const d = drafts[0];
        if (activeTab === "target") {
          await updateTarget(d.id, { ...d, target_amount: Number(d.amount) });
        } else {
          await updateRealization(d.id, { ...d, realization_amount: Number(d.amount) });
        }
      } else {
        if (activeTab === "target") {
          const payload = drafts.map(d => ({ ...d, target_amount: Number(d.amount) }));
          await saveTargets(payload);
        } else {
          const payload = drafts.map(d => ({ ...d, realization_amount: Number(d.amount) }));
          await saveRealizations(payload);
        }
      }
      setModalMode(null);
      loadList(1);
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  // Master CRUD Logic
  const openMasterModal = async (type: string, page: number = 1, search: string = searchQuery) => {
    setMasterType(type);
    setMasterLoading(true);
    try {
      const res = await fetchMasterList(type, page, search);
      setMasterList(res.data);
      setMasterCurrentPage(res.current_page);
      setMasterLastPage(res.last_page);
      if (type === 'sales_members') {
        fetchMasterList('teams', 1, '').then(r => setTeamList(r.data)).catch(console.error);
      }
    } catch (error) {
      toast.error("Gagal memuat master data");
    } finally {
      setMasterLoading(false);
    }
  };

  const handleAddMaster = async () => {
    if (!newMasterName.trim()) return;
    try {
      const payload: any = { name: newMasterName, code: newMasterCode, status: newMasterStatus };
      if (masterType === 'sales_members') payload.team_id = newMasterTeamId;
      await saveMasterData(masterType!, payload);
      setNewMasterName("");
      setNewMasterCode("");
      setNewMasterStatus(1);
      setNewMasterTeamId("");
      setIsAddMasterModalOpen(false);
      loadMaster();
      openMasterModal(masterType!, masterCurrentPage, searchQuery);
    } catch (error) {
      toast.error("Gagal menambah master");
    }
  };

  const handleUpdateMaster = async (id: number) => {
    if (!editMasterName.trim()) return;
    try {
      const payload: any = { name: editMasterName, code: editMasterCode, status: editMasterStatus };
      if (masterType === 'sales_members') payload.team_id = editMasterTeamId;
      await updateMasterData(masterType!, id, payload);
      setEditingMasterId(null);
      setIsEditMasterModalOpen(false);
      loadMaster();
      openMasterModal(masterType!, masterCurrentPage, searchQuery);
    } catch (error) {
      toast.error("Gagal mengubah master");
    }
  };

  const handleDeleteMaster = (id: number) => {
    showConfirm("Yakin hapus data master ini?", async () => {
      try {
        await deleteMasterData(masterType!, id);
        loadMaster();
        openMasterModal(masterType!, masterCurrentPage, searchQuery);
      } catch (error) {
        toast.error("Gagal menghapus master");
      }
    });
  };

  return (
    <>
      <PageHeader
        title={!masterType ? "Manajemen Sales" : `Master ${masterType.replace('_', ' ')}`}
        subtitle="Pusat Kelola Data Master dan Transaksi"
        actions={
          masterType ? (
            <button onClick={() => setMasterType(null)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm border border-slate-200">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Sales
            </button>
          ) : (
            <Link to="/sales" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm border border-slate-200">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </Link>
          )
        }
      />
      
      <datalist id="entities-list">
        {master?.entities.map(m => <option key={m.id} value={m.name} />)}
      </datalist>
      <datalist id="sales-list">
        {master?.sales_members.map(m => <option key={m.id} value={m.name} />)}
      </datalist>
      <datalist id="enduser-list">
        {master?.end_users.map(m => <option key={m.id} value={m.name} />)}
      </datalist>

      <div className="space-y-6">
        {!masterType ? (
          <>
            {/* Master Shortcuts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Pusat Kelola Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Master Team', type: 'teams', color: 'blue' }, 
                  { label: 'Master Sales Member', type: 'sales_members', color: 'emerald' }, 
                  { label: 'Master Entity', type: 'entities', color: 'indigo' }, 
                  { label: 'Master End User', type: 'end_users', color: 'amber' }
                ].map((item, i) => (
                  <div key={i} onClick={() => openMasterModal(item.type)} className={`flex items-center p-4 border rounded-xl hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer group ${item.color === 'blue' ? 'border-blue-100 bg-blue-50' : item.color === 'emerald' ? 'border-emerald-100 bg-emerald-50' : item.color === 'indigo' ? 'border-indigo-100 bg-indigo-50' : 'border-amber-100 bg-amber-50'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${item.color === 'blue' ? 'bg-blue-100 text-blue-600' : item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{item.label}</div>
                      <div className="text-xs text-slate-500">Kelola data master</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button 
                  onClick={() => setActiveTab('target')} 
                  className={`flex-1 py-4 px-6 text-sm font-bold text-center transition-colors ${activeTab === 'target' ? 'bg-white border-t-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  1. Data Target Sales
                </button>
                <button 
                  onClick={() => setActiveTab('realisasi')} 
                  className={`flex-1 py-4 px-6 text-sm font-bold text-center transition-colors ${activeTab === 'realisasi' ? 'bg-white border-t-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  2. Data Realisasi Sales
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Kelola {activeTab === 'target' ? 'Target' : 'Realisasi'}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setIsExportModalOpen(true)} className="bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-amber-700 transition flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                    <button onClick={() => { setIsImportModalOpen(true); setSelectedFile(null); }} className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700 transition flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Import Excel
                    </button>
                    <button onClick={openAddModal} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Tambah {activeTab === 'target' ? 'Target' : 'Realisasi'}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs">Periode</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs">Sales Member</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs">Entity</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs">End User</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs text-right">Amount (Rp)</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} className="text-center py-6">Loading...</td></tr>
                      ) : data.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-gray-500">Belum ada data.</td></tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id} className="bg-white border-b border-gray-50 hover:bg-slate-50 transition">
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs">{item.month}/{item.year}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-slate-800">{item.sales_member?.name || item.sales_member_name || '-'}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs">{item.entity?.name || item.entity_name || '-'}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold text-slate-700">{item.end_user?.name || item.end_user_name || '-'}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-emerald-600 font-semibold text-right">
                              Rp {Number(item.target_amount || item.realization_amount).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-center flex items-center justify-center gap-1.5">
                              <button onClick={() => openActionModal(item, 'detail')} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition" title="Detail">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => openActionModal(item, 'edit')} className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1.5 rounded-lg transition" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition" title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {!loading && data.length > 0 && lastPage > 1 && (
                  <Pagination 
                    currentPage={currentPage} 
                    lastPage={lastPage} 
                    onPageChange={loadList} 
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 capitalize">Master {masterType.replace('_', ' ')}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Cari kode atau nama..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && openMasterModal(masterType, 1, searchQuery)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button onClick={() => { setNewMasterName(''); setNewMasterCode(''); setNewMasterStatus(1); setNewMasterTeamId(''); setIsAddMasterModalOpen(true); }} className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-600 transition flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> {masterType === 'sales_members' ? 'Sales Member' : masterType.replace('_', ' ')}
                </button>
              </div>
            </div>
            
            {masterLoading ? (
              <div className="text-center py-10 text-gray-500">Loading master data...</div>
            ) : (
              <div className="overflow-x-auto p-0">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-gray-200">
                    <tr>
                      {masterType !== 'end_users' && <th className="px-6 py-4 font-bold">CODE</th>}
                      <th className="px-6 py-4 font-bold w-full">NAME</th>
                      {masterType === 'sales_members' && <th className="px-6 py-4 font-bold">TEAM</th>}
                      {masterType !== 'end_users' && <th className="px-6 py-4 font-bold">STATUS</th>}
                      <th className="px-6 py-4 font-bold text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterList.map(m => (
                      <tr key={m.id} className="bg-white border-b border-gray-50 hover:bg-slate-50 transition">
                        {masterType !== 'end_users' && (
                          <td className="px-6 py-4 text-slate-800 font-semibold whitespace-nowrap">
                            {m.code || '-'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-800 font-semibold uppercase">
                          {m.name}
                        </td>
                        {masterType === 'sales_members' && (
                          <td className="px-6 py-4 text-slate-600 uppercase">
                            {m.team?.name || '-'}
                          </td>
                        )}
                        {masterType !== 'end_users' && (
                          <td className="px-6 py-4 text-slate-800">
                            {m.status === 1 ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">Active</span> : 
                             m.status === 0 ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold">Inactive</span> : '-'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button onClick={() => { setEditingMasterId(m.id); setEditMasterName(m.name); setEditMasterCode(m.code || ''); setEditMasterStatus(m.status !== undefined ? m.status : 1); setEditMasterTeamId(m.team_id || ''); setIsEditMasterModalOpen(true); }} className="text-blue-600 hover:text-blue-800 mx-2 text-xs font-semibold">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteMaster(m.id)} className="text-red-600 hover:text-red-800 mx-2 text-xs font-semibold">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {masterList.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-500 font-semibold">Belum ada data {masterType.replace('_', ' ')}.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {!masterLoading && masterList.length > 0 && masterLastPage > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Halaman <span className="font-medium">{masterCurrentPage}</span> dari <span className="font-medium">{masterLastPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => openMasterModal(masterType, masterCurrentPage - 1, searchQuery)}
                        disabled={masterCurrentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openMasterModal(masterType, masterCurrentPage + 1, searchQuery)}
                        disabled={masterCurrentPage === masterLastPage}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit/Detail Target / Realisasi Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0 rounded-t-2xl bg-white">
              <h3 className="text-lg font-bold text-slate-800 capitalize">{modalMode} {activeTab === 'target' ? 'Target' : 'Realisasi'}</h3>
              
              {modalMode === 'add' && (
                <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-100 rounded-full">
                  <button 
                    type="button"
                    onClick={() => setCurrentDraftIndex(Math.max(0, currentDraftIndex - 1))}
                    disabled={currentDraftIndex === 0}
                    className="text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700">
                    Draft ke-{currentDraftIndex + 1} dari {drafts.length}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setCurrentDraftIndex(Math.min(drafts.length - 1, currentDraftIndex + 1))}
                    disabled={currentDraftIndex === drafts.length - 1}
                    className="text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button onClick={() => setModalMode(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto grow bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  {modalMode === 'detail' ? (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-semibold">{drafts[currentDraftIndex].year}</div>
                  ) : (
                    <input type="number" required value={drafts[currentDraftIndex].year} onChange={e => { const newDrafts = [...drafts]; newDrafts[currentDraftIndex].year = Number(e.target.value); setDrafts(newDrafts); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                  {modalMode === 'detail' ? (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-semibold">{MONTHS[drafts[currentDraftIndex].month - 1]}</div>
                  ) : (
                    <select 
                      required 
                      value={drafts[currentDraftIndex].month} 
                      onChange={e => { const newDrafts = [...drafts]; newDrafts[currentDraftIndex].month = Number(e.target.value); setDrafts(newDrafts); }} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={i + 1}>{MONTHS[i]}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Member</label>
                {modalMode === 'detail' ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-semibold">{drafts[currentDraftIndex].sales_member_name || '-'}</div>
                ) : (
                  <input list="sales-list" required value={drafts[currentDraftIndex].sales_member_name} onChange={e => { const newDrafts = [...drafts]; newDrafts[currentDraftIndex].sales_member_name = e.target.value; setDrafts(newDrafts); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                {modalMode === 'detail' ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-semibold">{drafts[currentDraftIndex].entity_name || '-'}</div>
                ) : (
                  <input list="entities-list" required value={drafts[currentDraftIndex].entity_name} onChange={e => { const newDrafts = [...drafts]; newDrafts[currentDraftIndex].entity_name = e.target.value; setDrafts(newDrafts); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End User</label>
                {modalMode === 'detail' ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-semibold">{drafts[currentDraftIndex].end_user_name || '-'}</div>
                ) : (
                  <input list="enduser-list" required value={drafts[currentDraftIndex].end_user_name} onChange={e => { const newDrafts = [...drafts]; newDrafts[currentDraftIndex].end_user_name = e.target.value; setDrafts(newDrafts); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rp)</label>
                {modalMode === 'detail' ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-lg text-emerald-600 font-bold tracking-wide">
                    Rp {Number(drafts[currentDraftIndex].amount).toLocaleString('id-ID')}
                  </div>
                ) : (
                  <input type="number" required value={drafts[currentDraftIndex].amount} onChange={e => { const newDrafts = [...drafts]; newDrafts[currentDraftIndex].amount = e.target.value; setDrafts(newDrafts); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                )}
              </div>
            </div>
              
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-white rounded-b-2xl shrink-0">
              <div className="flex gap-2">
                {modalMode === 'add' && (
                  <button 
                    type="button"
                    onClick={() => { setDrafts([...drafts, createEmptySalesDraft()]); setCurrentDraftIndex(drafts.length); }}
                    className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors text-sm font-semibold shadow-sm"
                    title="Tambah Draft Baru"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Draft
                  </button>
                )}
                {modalMode === 'add' && drafts.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => {
                      showConfirm("Hapus draft ini?", () => {
                        const newDrafts = drafts.filter((_, i) => i !== currentDraftIndex);
                        setDrafts(newDrafts);
                        setCurrentDraftIndex(Math.max(0, currentDraftIndex - 1));
                      });
                    }}
                    className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors text-sm font-semibold shadow-sm"
                    title="Hapus Draft Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setModalMode(null)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
                  {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                </button>
                {modalMode !== 'detail' && (
                  <button type="button" onClick={handleSaveDraft} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                    <Save className="w-4 h-4" /> {modalMode === 'edit' ? 'Update' : 'Simpan Semua'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Add Master Modal */}
      {isAddMasterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Tambah Master {masterType?.replace('_', ' ')}</h3>
              <button onClick={() => setIsAddMasterModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {masterType !== 'end_users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode (Opsional)</label>
                  <input type="text" value={newMasterCode} onChange={e => setNewMasterCode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" value={newMasterName} onChange={e => setNewMasterName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              {masterType === 'sales_members' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select value={newMasterTeamId} onChange={e => setNewMasterTeamId(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                    <option value="">Pilih Team</option>
                    {teamList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              {masterType !== 'end_users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={newMasterStatus} onChange={e => setNewMasterStatus(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 w-full mt-6 pt-4 border-t">
                <button onClick={() => setIsAddMasterModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Batal</button>
                <button onClick={handleAddMaster} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Master Modal */}
      {isEditMasterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Master {masterType?.replace('_', ' ')}</h3>
              <button onClick={() => setIsEditMasterModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {masterType !== 'end_users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                  <input type="text" value={editMasterCode} onChange={e => setEditMasterCode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" value={editMasterName} onChange={e => setEditMasterName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              {masterType === 'sales_members' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select value={editMasterTeamId} onChange={e => setEditMasterTeamId(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                    <option value="">Pilih Team</option>
                    {teamList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              {masterType !== 'end_users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={editMasterStatus} onChange={e => setEditMasterStatus(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 w-full mt-6 pt-4 border-t">
                <button onClick={() => setIsEditMasterModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Batal</button>
                <button onClick={() => handleUpdateMaster(editingMasterId!)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Update</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Import Excel Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Import Data via Excel</h3>
              <button onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Silakan pilih file Excel (.xlsx, .xls, .csv) yang berisi data {activeTab === 'target' ? 'Target' : 'Realisasi'} Sales. 
                Pastikan format kolom sudah sesuai dengan template yang ditentukan.
              </p>
              
              {selectedFile ? (
                <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50">
                  <FileText className="w-12 h-12 text-blue-500 mb-3" />
                  <p className="text-sm font-bold text-slate-800 mb-1">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mb-6">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  
                  <div className="flex gap-3 w-full">
                    <button 
                      disabled={uploading}
                      onClick={() => setSelectedFile(null)}
                      className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button 
                      disabled={uploading}
                      onClick={() => processUploadFile(selectedFile)}
                      className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? <span className="flex items-center gap-2"><Upload className="w-4 h-4 animate-bounce" /> Menyimpan...</span> : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Upload & Simpan</span>}
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}
                >
                  <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className={`text-sm font-medium mb-4 transition-colors ${isDragging ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {isDragging ? 'Lepaskan file di sini' : 'Drag & drop file di sini atau klik tombol di bawah'}
                  </p>
                  <input type="file" hidden ref={fileInputRef} accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  <button 
                    disabled={uploading} 
                    onClick={() => fileInputRef.current?.click()} 
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    Pilih File Excel
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mt-4">
                <div className="mt-0.5">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-800">Butuh Template?</h4>
                  <p className="text-xs text-blue-600 mb-2 mt-1">Unduh template Excel resmi untuk mempermudah proses pengisian data {activeTab === 'target' ? 'Target' : 'Realisasi'}.</p>
                  <a 
                    href={apiUrl(`/api/sales/templates/${activeTab === 'target' ? 'target' : 'realisasi'}`)} 
                    download 
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded transition"
                  >
                    Unduh Template {activeTab === 'target' ? 'Target' : 'Realisasi'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Export Excel Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Export Data {activeTab === 'target' ? 'Target' : 'Realisasi'}</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Pilih rentang waktu data yang ingin Anda export ke format Excel. Biarkan kosong jika ingin export semua data.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Awal</label>
                  <select 
                    value={exportFilter.start_year} 
                    onChange={e => setExportFilter({...exportFilter, start_year: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  >
                    <option value={0}>Semua</option>
                    {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulan Awal</label>
                  <select 
                    value={exportFilter.start_month} 
                    onChange={e => setExportFilter({...exportFilter, start_month: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  >
                    {Array.from({length: 12}, (_, i) => i+1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Akhir</label>
                  <select 
                    value={exportFilter.end_year} 
                    onChange={e => setExportFilter({...exportFilter, end_year: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  >
                    <option value={0}>Semua</option>
                    {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulan Akhir</label>
                  <select 
                    value={exportFilter.end_month} 
                    onChange={e => setExportFilter({...exportFilter, end_month: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  >
                    {Array.from({length: 12}, (_, i) => i+1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-6 pt-4 border-t">
                <button 
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <a 
                  href={apiUrl(`/api/sales/${activeTab === 'target' ? 'targets' : 'realizations'}/export?start_year=${exportFilter.start_year || ''}&start_month=${exportFilter.start_month}&end_year=${exportFilter.end_year || ''}&end_month=${exportFilter.end_month}`)}
                  download
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 bg-amber-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Excel
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </>
  );
}
