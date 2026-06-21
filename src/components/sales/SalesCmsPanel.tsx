import { useState, useEffect, useRef } from "react";
import { X, Trash2, Plus, Upload, Edit, Save, Download, FileText } from "lucide-react";
import {
  fetchTargets,
  fetchRealizations,
  saveTargets,
  saveRealizations,
  deleteTarget,
  deleteRealization,
  importTargetsExcel,
  importRealizationsExcel,
  fetchMasterList,
  saveMasterData,
  updateMasterData,
  deleteMasterData,
  type MasterData,
} from "@/api/sales";
import { apiUrl } from "@/lib/api";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  master: MasterData | null;
};

export default function SalesCmsPanel({ open, onClose, master }: Props) {
  const [activeTab, setActiveTab] = useState<"target" | "realisasi">("target");
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Master Modals
  const [masterType, setMasterType] = useState<string | null>(null);
  const [masterList, setMasterList] = useState<any[]>([]);
  const [masterCurrentPage, setMasterCurrentPage] = useState(1);
  const [masterLastPage, setMasterLastPage] = useState(1);
  const [masterLoading, setMasterLoading] = useState(false);
  const [editingMasterId, setEditingMasterId] = useState<number | null>(null);
  const [editMasterName, setEditMasterName] = useState("");
  const [newMasterName, setNewMasterName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (open) loadList(1);
    // eslint-disable-next-line
  }, [open, activeTab]);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      if (activeTab === "target") await deleteTarget(id);
      else await deleteRealization(id);
      loadList();
    } catch (error) {
      toast.error("Gagal menghapus data");
    }
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
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    setDrafts([{ year: currentYear, month: currentMonth, sales_member_name: '', entity_name: '', end_user_name: '', amount: '' }]);
    setActiveIndex(0);
    setIsAddOpen(true);
  };

  const handleSaveDrafts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === "target") {
        await saveTargets(drafts.map(d => ({ ...d, target_amount: Number(d.amount) })));
      } else {
        await saveRealizations(drafts.map(d => ({ ...d, realization_amount: Number(d.amount) })));
      }
      setIsAddOpen(false);
      loadList();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    }
  };

  // Master CRUD Logic
  const openMasterModal = async (type: string, page: number = 1) => {
    setMasterType(type);
    setMasterLoading(true);
    try {
      const res = await fetchMasterList(type, page);
      setMasterList(res.data);
      setMasterCurrentPage(res.current_page);
      setMasterLastPage(res.last_page);
    } catch (error) {
      toast.error("Gagal memuat master data");
    } finally {
      setMasterLoading(false);
    }
  };

  const handleAddMaster = async () => {
    if (!newMasterName.trim()) return;
    try {
      await saveMasterData(masterType!, { name: newMasterName });
      setNewMasterName("");
      openMasterModal(masterType!, masterCurrentPage);
    } catch (error) {
      toast.error("Gagal menambah master");
    }
  };

  const handleUpdateMaster = async (id: number) => {
    if (!editMasterName.trim()) return;
    try {
      await updateMasterData(masterType!, id, { name: editMasterName });
      setEditingMasterId(null);
      openMasterModal(masterType!, masterCurrentPage);
    } catch (error) {
      toast.error("Gagal mengubah master");
    }
  };

  const handleDeleteMaster = async (id: number) => {
    try {
      if (!confirm("Hapus master data ini?")) return;
      await deleteMasterData(masterType!, id);
      openMasterModal(masterType!, masterCurrentPage); // reload
    } catch (err) {
      toast.error("Gagal menghapus master");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto">
      <datalist id="entities-list">
        {master?.entities.map(m => <option key={m.id} value={m.name} />)}
      </datalist>
      <datalist id="sales-list">
        {master?.sales_members.map(m => <option key={m.id} value={m.name} />)}
      </datalist>
      <datalist id="enduser-list">
        {master?.end_users.map(m => <option key={m.id} value={m.name} />)}
      </datalist>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Kelola Data Sales</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
          <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
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
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-center">
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 mx-1">
                            Hapus
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
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{lastPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => loadList(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => loadList(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Tambah {activeTab === 'target' ? 'Target' : 'Realisasi'}</h3>
              <button onClick={() => setIsAddOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <button type="button" onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-50" disabled={activeIndex === 0}>
                  &lt;
                </button>
                <div className="text-xs font-semibold text-slate-600">
                  Draft ke-{activeIndex + 1} dari {drafts.length}
                </div>
                <button type="button" onClick={() => setActiveIndex(Math.min(drafts.length - 1, activeIndex + 1))} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-50" disabled={activeIndex === drafts.length - 1}>
                  &gt;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                  <select 
                    value={drafts[activeIndex].year} 
                    onChange={e => { const d = [...drafts]; d[activeIndex].year = Number(e.target.value); setDrafts(d); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
                  <select 
                    value={drafts[activeIndex].month} 
                    onChange={e => { const d = [...drafts]; d[activeIndex].month = Number(e.target.value); setDrafts(d); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                  >
                    {Array.from({length: 12}, (_, i) => i+1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
                <input 
                  type="text" 
                  list="entities-list"
                  value={drafts[activeIndex].entity_name}
                  onChange={e => { const d = [...drafts]; d[activeIndex].entity_name = e.target.value; setDrafts(d); }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500" 
                  placeholder="Ketik atau pilih entity..." 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sales Member</label>
                <input 
                  type="text" 
                  list="sales-list"
                  value={drafts[activeIndex].sales_member_name}
                  onChange={e => { const d = [...drafts]; d[activeIndex].sales_member_name = e.target.value; setDrafts(d); }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500" 
                  placeholder="Ketik atau pilih sales..." 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">End User</label>
                <input 
                  type="text" 
                  list="enduser-list"
                  value={drafts[activeIndex].end_user_name}
                  onChange={e => { const d = [...drafts]; d[activeIndex].end_user_name = e.target.value; setDrafts(d); }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500" 
                  placeholder="Ketik atau pilih end user..." 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rp)</label>
                <input 
                  type="number" 
                  value={drafts[activeIndex].amount}
                  onChange={e => { const d = [...drafts]; d[activeIndex].amount = e.target.value; setDrafts(d); }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500" 
                  placeholder="0"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-gray-50 flex justify-between items-center">
              <div className="flex space-x-2">
                <button type="button" onClick={() => {
                  setDrafts([...drafts, { year: new Date().getFullYear(), month: new Date().getMonth() + 1, sales_member_name: '', entity_name: '', end_user_name: '', amount: '' }]);
                  setActiveIndex(drafts.length);
                }} className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 font-bold text-xl">+</button>
                {drafts.length > 1 && (
                  <button type="button" onClick={() => {
                    const newDrafts = drafts.filter((_, i) => i !== activeIndex);
                    setDrafts(newDrafts);
                    setActiveIndex(Math.max(0, activeIndex - 1));
                  }} className="h-10 px-3 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 font-semibold text-sm">Hapus</button>
                )}
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                <button type="button" onClick={handleSaveDrafts} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Simpan Semua</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Data Modal */}
      {masterType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-slate-800 capitalize">Kelola Master {masterType.replace('_', ' ')}</h3>
              <button onClick={() => setMasterType(null)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newMasterName}
                  onChange={e => setNewMasterName(e.target.value)}
                  placeholder="Nama master baru..." 
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500"
                />
                <button onClick={handleAddMaster} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  Tambah
                </button>
              </div>

              {masterLoading ? (
                <div className="text-center py-10 text-gray-500">Loading master data...</div>
              ) : (
                <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">ID</th>
                      <th className="px-4 py-3 font-bold w-full">Nama</th>
                      <th className="px-4 py-3 font-bold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterList.map(m => (
                      <tr key={m.id} className="bg-white border-b border-gray-50 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-500">{m.id}</td>
                        <td className="px-4 py-2.5 text-slate-800 font-semibold">
                          {editingMasterId === m.id ? (
                            <input 
                              type="text" 
                              value={editMasterName}
                              onChange={e => setEditMasterName(e.target.value)}
                              className="w-full border border-blue-300 rounded px-2 py-1 text-sm outline-none"
                              autoFocus
                            />
                          ) : m.name}
                        </td>
                        <td className="px-4 py-2.5 text-center whitespace-nowrap">
                          {editingMasterId === m.id ? (
                            <button onClick={() => handleUpdateMaster(m.id)} className="text-emerald-600 hover:text-emerald-800 mx-1 p-1 bg-emerald-50 rounded">
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => { setEditingMasterId(m.id); setEditMasterName(m.name); }} className="text-blue-600 hover:text-blue-800 mx-1 p-1 bg-blue-50 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteMaster(m.id)} className="text-red-600 hover:text-red-800 mx-1 p-1 bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Master Pagination Controls */}
              {!masterLoading && masterList.length > 0 && masterLastPage > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Halaman <span className="font-medium">{masterCurrentPage}</span> dari <span className="font-medium">{masterLastPage}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => openMasterModal(masterType!, masterCurrentPage - 1)}
                          disabled={masterCurrentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openMasterModal(masterType!, masterCurrentPage + 1)}
                          disabled={masterCurrentPage === masterLastPage}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
}
