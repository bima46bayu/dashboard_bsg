import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/PageShell";
import { Plus, ArrowLeft, Download, User, Edit, Trash2, X, ChevronLeft, ChevronRight, Save, Eye, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/format";
import { fetchProfitabilities, deleteProfitability, saveProfitabilities, updateProfitability, downloadProfitabilitiesTemplate, downloadProfitabilitiesExport, importProfitabilitiesExcel } from "@/api/profitability";
import { fetchMasterData, type MasterData, fetchMasterList, saveMasterData, updateMasterData, deleteMasterData } from "@/api/sales";

type FinancialItem = {
  id: string;
  description: string;
  amount: number;
};

type FormState = {
  id?: number;
  entity_id: string;
  year: number;
  month: number;
  pendapatan: FinancialItem[];
  hpp: FinancialItem[];
  biaya_marketing: FinancialItem[];
  biaya_admin: FinancialItem[];
  biaya_non_ops: FinancialItem[];
  pendapatan_lain: FinancialItem[];
  biaya_lain: FinancialItem[];
  pajak: FinancialItem[];
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyForm = (): FormState => ({
  entity_id: "",
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  pendapatan: [],
  hpp: [],
  biaya_marketing: [],
  biaya_admin: [],
  biaya_non_ops: [],
  pendapatan_lain: [],
  biaya_lain: [],
  pajak: []
});

const DynamicInputSection = ({ 
  title, 
  field, 
  items,
  total,
  onAdd,
  onUpdate,
  onRemove
}: { 
  title: string; 
  field: keyof FormState; 
  items: FinancialItem[];
  total?: number;
  onAdd: (field: keyof FormState) => void;
  onUpdate: (field: keyof FormState, id: string, key: keyof FinancialItem, value: any) => void;
  onRemove: (field: keyof FormState, id: string) => void;
}) => (
  <div className="mb-5 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <div className="bg-slate-100/50 border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h4>
      {total !== undefined && (
        <div className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
          Total: <span className="text-blue-700 ml-1">{formatCurrency(total)}</span>
        </div>
      )}
    </div>
    
    <div className="p-5 bg-white">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-5">
          <p className="text-sm text-slate-500 mb-3">Tidak ada data {title.toLowerCase()}</p>
          <button
            onClick={() => onAdd(field)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Baris
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex-[2]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => onUpdate(field, item.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium text-slate-800"
                  placeholder={`Contoh: Pendapatan Proyek ${index + 1}`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={item.amount || ''}
                  onChange={(e) => onUpdate(field, item.id, 'amount', parseFloat(e.target.value) || 0)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-semibold text-emerald-700"
                  placeholder="0"
                />
              </div>
              <div className="pt-5">
                <button
                  onClick={() => onRemove(field, item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Hapus baris ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <button
              onClick={() => onAdd(field)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);


export default function ProfitabilityManagementPage() {
  const [activeTab, setActiveTab] = useState<"list" | "master">("list");
  
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const [master, setMaster] = useState<MasterData | null>(null);

  // List data
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchProfitabilities(page);
      setData(res.data.map((item: any) => ({
        ...item,
        entity: item.entity?.name || 'Unknown'
      })));
      setCurrentPage(res.current_page);
      setLastPage(res.last_page);
    } catch (err) {
      console.error("Failed to fetch profitabilities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMasterData().then(setMaster).catch(console.error);
  }, []);

  // Master Entity CRUD states
  const [masterList, setMasterList] = useState<any[]>([]);
  const [masterCurrentPage, setMasterCurrentPage] = useState(1);
  const [masterLastPage, setMasterLastPage] = useState(1);
  const [masterLoading, setMasterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAddMasterModalOpen, setIsAddMasterModalOpen] = useState(false);
  const [isEditMasterModalOpen, setIsEditMasterModalOpen] = useState(false);
  const [editingMasterId, setEditingMasterId] = useState<number | null>(null);
  
  const [newMasterName, setNewMasterName] = useState("");
  const [newMasterCode, setNewMasterCode] = useState("");
  const [newMasterStatus, setNewMasterStatus] = useState<number>(1);
  
  const [editMasterName, setEditMasterName] = useState("");
  const [editMasterCode, setEditMasterCode] = useState("");
  const [editMasterStatus, setEditMasterStatus] = useState<number>(1);

  const loadMasterList = async (page: number = 1, search: string = searchQuery) => {
    setMasterLoading(true);
    try {
      const res = await fetchMasterList('entities', page, search);
      setMasterList(res.data);
      setMasterCurrentPage(res.current_page);
      setMasterLastPage(res.last_page);
    } catch (error) {
      console.error(error);
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'master') {
      loadMasterList(1);
    }
  }, [activeTab]);

  const handleAddMaster = async () => {
    if (!newMasterName.trim()) return;
    try {
      await saveMasterData('entities', { name: newMasterName, code: newMasterCode, status: newMasterStatus });
      setNewMasterName(""); setNewMasterCode(""); setNewMasterStatus(1);
      setIsAddMasterModalOpen(false);
      fetchMasterData().then(setMaster).catch(console.error);
      loadMasterList(masterCurrentPage, searchQuery);
    } catch (error) {
      alert("Gagal menambah master");
    }
  };

  const handleUpdateMaster = async (id: number) => {
    if (!editMasterName.trim()) return;
    try {
      await updateMasterData('entities', id, { name: editMasterName, code: editMasterCode, status: editMasterStatus });
      setEditingMasterId(null);
      setIsEditMasterModalOpen(false);
      fetchMasterData().then(setMaster).catch(console.error);
      loadMasterList(masterCurrentPage, searchQuery);
    } catch (error) {
      alert("Gagal mengubah master");
    }
  };

  const handleDeleteMaster = async (id: number) => {
    if (!window.confirm("Yakin hapus data master ini?")) return;
    try {
      await deleteMasterData('entities', id);
      fetchMasterData().then(setMaster).catch(console.error);
      loadMasterList(masterCurrentPage, searchQuery);
    } catch (error) {
      alert("Gagal menghapus master");
    }
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drafts, setDrafts] = useState<FormState[]>([createEmptyForm()]);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    try {
      await downloadProfitabilitiesExport();
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh data");
    }
  };

  const handleExportTemplate = async () => {
    try {
      await downloadProfitabilitiesTemplate();
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh template");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert("Pilih file excel terlebih dahulu");
      return;
    }
    setIsImporting(true);
    try {
      await importProfitabilitiesExcel(importFile);
      setIsImportModalOpen(false);
      setImportFile(null);
      alert("Data berhasil diimpor!");
      fetchData(1);
    } catch (err: any) {
      alert(err.message || "Gagal mengimpor data");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteList = async (id: number) => {
    if (window.confirm("Yakin hapus data ini?")) {
      try {
        await deleteProfitability(id);
        fetchData(currentPage);
      } catch (err: any) {
        alert("Gagal menghapus data: " + err.message);
      }
    }
  };

  const openAddModal = () => {
    setDrafts([createEmptyForm()]);
    setCurrentDraftIndex(0);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    const editDraft: FormState = {
      id: item.id,
      entity_id: item.entity_id ? item.entity_id.toString() : "",
      year: item.year,
      month: item.month,
      pendapatan: item.pendapatan_items || [],
      hpp: item.hpp_items || [],
      biaya_marketing: item.biaya_marketing_items || [],
      biaya_admin: item.biaya_admin_items || [],
      biaya_non_ops: item.biaya_non_ops_items || [],
      pendapatan_lain: item.pendapatan_lain_items || [],
      biaya_lain: item.biaya_lain_items || [],
      pajak: item.pajak_items || [],
    };
    setDrafts([editDraft]);
    setCurrentDraftIndex(0);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const addDraft = () => {
    setDrafts([...drafts, createEmptyForm()]);
    setCurrentDraftIndex(drafts.length);
  };

  const currentDraft = drafts[currentDraftIndex];

  const updateCurrentDraft = (updates: Partial<FormState>) => {
    const newDrafts = [...drafts];
    newDrafts[currentDraftIndex] = { ...currentDraft, ...updates };
    setDrafts(newDrafts);
  };

  const sumAmounts = (items: FinancialItem[]) => items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const addItem = (field: keyof FormState) => {
    if (field === 'entity_id' || field === 'year' || field === 'month') return;
    const items = currentDraft[field] as FinancialItem[];
    updateCurrentDraft({
      [field]: [...items, { id: generateId(), description: "", amount: 0 }]
    });
  };

  const updateItem = (field: keyof FormState, id: string, key: keyof FinancialItem, value: any) => {
    if (field === 'entity_id' || field === 'year' || field === 'month') return;
    const items = currentDraft[field] as FinancialItem[];
    updateCurrentDraft({
      [field]: items.map(item => item.id === id ? { ...item, [key]: value } : item)
    });
  };

  const removeItem = (field: keyof FormState, id: string) => {
    if (field === 'entity_id' || field === 'year' || field === 'month') return;
    const items = currentDraft[field] as FinancialItem[];
    updateCurrentDraft({
      [field]: items.filter(item => item.id !== id)
    });
  };

  const handleSaveAll = async () => {
    const payload = drafts.map(d => {
      const sum = (items: FinancialItem[]) => items.reduce((s, item) => s + (Number(item.amount) || 0), 0);
      const pendapatan = sum(d.pendapatan);
      const hpp = sum(d.hpp);
      const laba_kotor = pendapatan - hpp;
      const marketing = sum(d.biaya_marketing);
      const admin = sum(d.biaya_admin);
      const non_ops = sum(d.biaya_non_ops);
      const total_biaya_overhead = marketing + admin + non_ops;
      const laba_operasi = laba_kotor - total_biaya_overhead;
      const p_lain = sum(d.pendapatan_lain);
      const b_lain = sum(d.biaya_lain);
      const laba_sebelum_pajak = laba_operasi + p_lain - b_lain;
      const pajak = sum(d.pajak);
      const laba_bersih = laba_sebelum_pajak - pajak;

      return {
        id: d.id,
        year: d.year,
        month: d.month,
        entity_id: d.entity_id,
        pendapatan_items: d.pendapatan,
        hpp_items: d.hpp,
        biaya_marketing_items: d.biaya_marketing,
        biaya_admin_items: d.biaya_admin,
        biaya_non_ops_items: d.biaya_non_ops,
        pendapatan_lain_items: d.pendapatan_lain,
        biaya_lain_items: d.biaya_lain,
        pajak_items: d.pajak,
        pendapatan,
        laba_kotor,
        total_biaya_overhead,
        laba_operasi,
        laba_sebelum_pajak,
        laba_bersih
      };
    });

    try {
      if (isEditMode && payload.length === 1 && payload[0].id) {
        await updateProfitability(payload[0].id, payload[0]);
      } else {
        await saveProfitabilities(payload);
      }
      setIsModalOpen(false);
      fetchData(1);
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    }
  };

  // Calculations for current draft
  const totalPendapatan = sumAmounts(currentDraft.pendapatan);
  const totalHPP = sumAmounts(currentDraft.hpp);
  const labaKotor = totalPendapatan - totalHPP;
  
  const totalMarketing = sumAmounts(currentDraft.biaya_marketing);
  const totalAdmin = sumAmounts(currentDraft.biaya_admin);
  const totalNonOps = sumAmounts(currentDraft.biaya_non_ops);
  const totalOverhead = totalMarketing + totalAdmin + totalNonOps;
  
  const labaOperasi = labaKotor - totalOverhead;
  
  const totalPendapatanLain = sumAmounts(currentDraft.pendapatan_lain);
  const totalBiayaLain = sumAmounts(currentDraft.biaya_lain);
  
  const labaSebelumPajak = labaOperasi + totalPendapatanLain - totalBiayaLain;
  
  const totalPajak = sumAmounts(currentDraft.pajak);
  const labaSetelahPajak = labaSebelumPajak - totalPajak;



  return (
    <>
      <PageHeader
        title={activeTab === 'list' ? "CMS Profitability" : "Master Entity (Profitability)"}
        subtitle="Kelola Data Laba Rugi dan Entitas"
        actions={
          activeTab === 'master' ? (
            <button 
              onClick={() => setActiveTab('list')} 
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke CMS
            </button>
          ) : (
            <Link 
              to="/profitability" 
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </Link>
          )
        }
      />

      <div className="space-y-6">
        {activeTab === 'list' ? (
          <>
            {/* Master Shortcuts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Pusat Kelola Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab('master')} 
                  className="flex items-center p-4 border border-indigo-100 bg-indigo-50 rounded-xl hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Master Entity</div>
                    <div className="text-xs text-slate-500">Kelola entitas bisnis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Data Profitability</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsImportModalOpen(true)}
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700 transition flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 rotate-180" /> Import
                    </button>
                    <button 
                      onClick={handleExportData}
                      className="bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-amber-700 transition flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button 
                      onClick={openAddModal} 
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Data
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs">Periode</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs">Entity</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs text-right">Pendapatan</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs text-right">Laba Sblm Pajak</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs text-right">Laba Bersih</th>
                        <th className="px-4 py-3 font-bold whitespace-nowrap text-xs text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6 text-gray-500">Belum ada data.</td></tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id} className="bg-white border-b border-gray-50 hover:bg-slate-50 transition">
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-slate-800">
                              {item.month.toString().padStart(2, '0')}/{item.year}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold text-slate-700">
                              {item.entity}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-slate-600 text-right">
                              {formatCurrency(item.pendapatan)}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-blue-600 font-bold text-right">
                              {formatCurrency(item.laba_sebelum_pajak || 0)}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-emerald-600 font-bold text-right">
                              {formatCurrency(item.laba_bersih)}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-center flex items-center justify-center gap-1">
                              <button 
                                onClick={() => setSelectedDetail(item)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openEditModal(item)}
                                className="text-amber-600 hover:text-amber-900 p-1"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteList(item.id)} 
                                className="text-red-600 hover:text-red-900 mx-1 p-1"
                                title="Hapus"
                              >
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
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-xl">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{lastPage}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => fetchData(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => fetchData(currentPage + 1)}
                            disabled={currentPage === lastPage}
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
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 capitalize">Master Entity</h3>
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
                    onKeyDown={(e) => e.key === 'Enter' && loadMasterList(1, searchQuery)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button onClick={() => { setNewMasterName(''); setNewMasterCode(''); setNewMasterStatus(1); setIsAddMasterModalOpen(true); }} className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-600 transition flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Entity
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
                      <th className="px-6 py-4 font-bold">CODE</th>
                      <th className="px-6 py-4 font-bold w-full">NAME</th>
                      <th className="px-6 py-4 font-bold">STATUS</th>
                      <th className="px-6 py-4 font-bold text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterList.map((m: any) => (
                      <tr key={m.id} className="bg-white border-b border-gray-50 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-slate-800 font-semibold whitespace-nowrap">
                          {m.code || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-semibold uppercase">
                          {m.name}
                        </td>
                        <td className="px-6 py-4 text-slate-800">
                          {m.status === 1 ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">Active</span> : 
                           m.status === 0 ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold">Inactive</span> : '-'}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button onClick={() => {
                            setEditingMasterId(m.id);
                            setEditMasterName(m.name);
                            setEditMasterCode(m.code || "");
                            setEditMasterStatus(m.status ?? 1);
                            setIsEditMasterModalOpen(true);
                          }} className="text-amber-600 hover:text-amber-900 mx-1 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteMaster(m.id)} className="text-red-600 hover:text-red-900 mx-1 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination Controls Master */}
            {!masterLoading && masterList.length > 0 && masterLastPage > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-xl shadow-sm">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Halaman <span className="font-medium">{masterCurrentPage}</span> dari <span className="font-medium">{masterLastPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => loadMasterList(masterCurrentPage - 1, searchQuery)}
                        disabled={masterCurrentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => loadMasterList(masterCurrentPage + 1, searchQuery)}
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Import Excel</h3>
            <p className="text-sm text-slate-600 mb-4">
              Silakan unduh <button onClick={handleExportTemplate} className="text-blue-600 underline font-bold">Template Excel</button> terlebih dahulu jika Anda belum memilikinya. Pastikan mengisi data pada kolom yang tersedia dan jangan mengubah format header.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih File Excel (.xlsx)</label>
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={handleExportTemplate}
                className="px-4 py-2 text-blue-600 bg-blue-50 font-semibold hover:bg-blue-100 rounded-lg text-sm flex items-center gap-2 mr-auto"
              >
                <Download className="w-4 h-4" /> Template
              </button>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleImport}
                disabled={isImporting || !importFile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
              >
                {isImporting ? "Mengimpor..." : "Mulai Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white rounded-t-2xl shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditMode ? "Edit Data Profitability" : "Tambah Data Profitability"}
              </h3>
              
              {/* Pagination Draft Header */}
              {!isEditMode && (
              <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-100 rounded-full">
                <button 
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
                  onClick={() => setCurrentDraftIndex(Math.min(drafts.length - 1, currentDraftIndex + 1))}
                  disabled={currentDraftIndex === drafts.length - 1}
                  className="text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              )}

              <button 
                onClick={() => setIsModalOpen(false)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto bg-slate-50 grow">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entity</label>
                  <select
                    value={currentDraft.entity_id}
                    onChange={(e) => updateCurrentDraft({ entity_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Pilih Entity...</option>
                    {master?.entities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={currentDraft.year}
                    onChange={(e) => updateCurrentDraft({ year: Number(e.target.value) })}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
                  <select
                    value={currentDraft.month}
                    onChange={(e) => updateCurrentDraft({ month: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>{MONTHS[i]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <DynamicInputSection title="Pendapatan" field="pendapatan" items={currentDraft.pendapatan} total={totalPendapatan} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
              <DynamicInputSection title="Harga Pokok Penjualan (HPP)" field="hpp" items={currentDraft.hpp} total={totalHPP} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
              
              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <h3 className="font-bold text-slate-800">Laba Kotor</h3>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(labaKotor)}</span>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 text-slate-800 pl-1">Biaya Overhead</h2>
                <DynamicInputSection title="Biaya Marketing" field="biaya_marketing" items={currentDraft.biaya_marketing} total={totalMarketing} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
                <DynamicInputSection title="Biaya Admin & Umum" field="biaya_admin" items={currentDraft.biaya_admin} total={totalAdmin} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
                <DynamicInputSection title="Biaya Non Operasional" field="biaya_non_ops" items={currentDraft.biaya_non_ops} total={totalNonOps} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
                
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                  <h3 className="font-bold text-slate-800">Total Biaya Overhead</h3>
                  <span className="text-base font-bold text-slate-700">{formatCurrency(totalOverhead)}</span>
                </div>
              </div>

              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <h3 className="font-bold text-slate-800">Laba Operasi</h3>
                <span className={`text-lg font-bold ${labaOperasi < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(labaOperasi)}
                </span>
              </div>

              <DynamicInputSection title="Pendapatan Lain" field="pendapatan_lain" items={currentDraft.pendapatan_lain} total={totalPendapatanLain} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
              <DynamicInputSection title="Biaya Lain (Bunga, dll)" field="biaya_lain" items={currentDraft.biaya_lain} total={totalBiayaLain} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />

              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <h3 className="font-bold text-slate-800">Laba Bersih Sebelum Pajak</h3>
                <span className={`text-lg font-bold ${labaSebelumPajak < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(labaSebelumPajak)}
                </span>
              </div>
              
              <DynamicInputSection title="Pajak" field="pajak" items={currentDraft.pajak} total={totalPajak} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />

              <div className="mb-2 bg-blue-600 rounded-xl p-5 flex justify-between items-center shadow-md text-white">
                <h3 className="text-lg font-bold">Laba Bersih Setelah Pajak</h3>
                <span className="text-xl font-bold">
                  {formatCurrency(labaSetelahPajak)}
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-white rounded-b-2xl shrink-0">
              <div className="flex gap-2">
                {!isEditMode && (
                  <button 
                    onClick={addDraft}
                    className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors text-sm font-semibold shadow-sm"
                    title="Tambah Draft Baru"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Draft Laporan
                  </button>
                )}
                {!isEditMode && drafts.length > 1 && (
                  <button 
                    onClick={() => {
                      if(window.confirm("Hapus draft ini?")) {
                        const newDrafts = drafts.filter((_, i) => i !== currentDraftIndex);
                        setDrafts(newDrafts);
                        setCurrentDraftIndex(Math.max(0, currentDraftIndex - 1));
                      }
                    }}
                    className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors text-sm font-semibold shadow-sm"
                    title="Hapus Draft Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveAll} 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Semua
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        (() => {
          const getSum = (items: any[]) => items ? items.reduce((acc, curr) => acc + (curr.amount || 0), 0) : 0;
          const totalPendapatan = getSum(selectedDetail.pendapatan_items);
          const totalHpp = getSum(selectedDetail.hpp_items);
          const labaKotor = totalPendapatan - totalHpp;

          const totalMarketing = getSum(selectedDetail.biaya_marketing_items);
          const totalAdmin = getSum(selectedDetail.biaya_admin_items);
          const totalNonOps = getSum(selectedDetail.biaya_non_ops_items);
          const totalOverhead = totalMarketing + totalAdmin + totalNonOps;

          const labaOperasi = labaKotor - totalOverhead;

          const totalPendapatanLain = getSum(selectedDetail.pendapatan_lain_items);
          const totalBiayaLain = getSum(selectedDetail.biaya_lain_items);
          const labaSebelumPajak = labaOperasi + totalPendapatanLain - totalBiayaLain;

          const totalPajak = getSum(selectedDetail.pajak_items);
          const labaSetelahPajak = labaSebelumPajak - totalPajak;

          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 rounded-t-2xl bg-white shrink-0">
                  <h3 className="text-lg font-bold text-slate-800">Detail Profitability</h3>
                  <button onClick={() => setSelectedDetail(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto bg-slate-50 grow space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Periode</label>
                      <div className="text-sm font-bold text-slate-800">{selectedDetail.month.toString().padStart(2, '0')} / {selectedDetail.year}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Entity</label>
                      <div className="text-sm font-bold text-slate-800">{selectedDetail.entity}</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    
                    {/* Pendapatan */}
                    {selectedDetail.pendapatan_items && selectedDetail.pendapatan_items.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-800">Pendapatan</h4>
                          <span className="font-bold text-sm text-slate-800">Total: {formatCurrency(totalPendapatan)}</span>
                        </div>
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                          {selectedDetail.pendapatan_items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.description || '-'}</span>
                              <span className="font-medium text-slate-800">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* HPP */}
                    {selectedDetail.hpp_items && selectedDetail.hpp_items.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-800">Harga Pokok Penjualan (HPP)</h4>
                          <span className="font-bold text-sm text-slate-800">Total: {formatCurrency(totalHpp)}</span>
                        </div>
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                          {selectedDetail.hpp_items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.description || '-'}</span>
                              <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Laba Kotor */}
                    <div className="py-3 px-4 bg-slate-50 border border-gray-200 rounded-lg flex justify-between items-center">
                      <span className="font-bold text-slate-700">Laba Kotor</span>
                      <span className="font-bold text-blue-700 text-lg">{formatCurrency(labaKotor)}</span>
                    </div>

                    {/* Biaya Overhead */}
                    <div>
                      <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Biaya Overhead</h4>
                      
                      {selectedDetail.biaya_marketing_items && selectedDetail.biaya_marketing_items.length > 0 && (
                        <div className="mb-4 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-sm text-slate-700">Biaya Marketing</h5>
                            <span className="font-semibold text-xs text-slate-700">Total: {formatCurrency(totalMarketing)}</span>
                          </div>
                          <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                            {selectedDetail.biaya_marketing_items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600 text-xs">{item.description || '-'}</span>
                                <span className="font-medium text-xs text-red-600">-{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDetail.biaya_admin_items && selectedDetail.biaya_admin_items.length > 0 && (
                        <div className="mb-4 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-sm text-slate-700">Biaya Admin & Umum</h5>
                            <span className="font-semibold text-xs text-slate-700">Total: {formatCurrency(totalAdmin)}</span>
                          </div>
                          <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                            {selectedDetail.biaya_admin_items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600 text-xs">{item.description || '-'}</span>
                                <span className="font-medium text-xs text-red-600">-{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDetail.biaya_non_ops_items && selectedDetail.biaya_non_ops_items.length > 0 && (
                        <div className="mb-4 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-sm text-slate-700">Biaya Non Operasional</h5>
                            <span className="font-semibold text-xs text-slate-700">Total: {formatCurrency(totalNonOps)}</span>
                          </div>
                          <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                            {selectedDetail.biaya_non_ops_items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600 text-xs">{item.description || '-'}</span>
                                <span className="font-medium text-xs text-red-600">-{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="py-2 px-4 bg-slate-50 border border-gray-200 rounded-lg flex justify-between items-center ml-4 mt-2">
                        <span className="font-bold text-sm text-slate-700">Total Biaya Overhead</span>
                        <span className="font-bold text-slate-700">{formatCurrency(totalOverhead)}</span>
                      </div>
                    </div>

                    {/* Laba Operasi */}
                    <div className="py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
                      <span className="font-bold text-emerald-800">Laba Operasi</span>
                      <span className="font-bold text-emerald-700 text-lg">{formatCurrency(labaOperasi)}</span>
                    </div>

                    {/* Pendapatan Lain */}
                    {selectedDetail.pendapatan_lain_items && selectedDetail.pendapatan_lain_items.length > 0 && (
                      <div className="mb-4 mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-800">Pendapatan Lain</h4>
                          <span className="font-bold text-sm text-slate-800">Total: {formatCurrency(totalPendapatanLain)}</span>
                        </div>
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                          {selectedDetail.pendapatan_lain_items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.description || '-'}</span>
                              <span className="font-medium text-emerald-600">+{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Biaya Lain */}
                    {selectedDetail.biaya_lain_items && selectedDetail.biaya_lain_items.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-800">Biaya Lain (Bunga, dll)</h4>
                          <span className="font-bold text-sm text-slate-800">Total: {formatCurrency(totalBiayaLain)}</span>
                        </div>
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                          {selectedDetail.biaya_lain_items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.description || '-'}</span>
                              <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Laba Bersih Sebelum Pajak */}
                    <div className="py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center mt-6">
                      <span className="font-bold text-emerald-800">Laba Bersih Sebelum Pajak</span>
                      <span className="font-bold text-emerald-700 text-lg">{formatCurrency(labaSebelumPajak)}</span>
                    </div>

                    {/* Pajak */}
                    {selectedDetail.pajak_items && selectedDetail.pajak_items.length > 0 && (
                      <div className="mb-4 mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-800">Pajak</h4>
                          <span className="font-bold text-sm text-slate-800">Total: {formatCurrency(totalPajak)}</span>
                        </div>
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                          {selectedDetail.pajak_items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.description || '-'}</span>
                              <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Laba Bersih Setelah Pajak */}
                    <div className="py-4 px-5 bg-blue-600 rounded-xl shadow-md flex justify-between items-center mt-8">
                      <span className="font-bold text-white text-lg">Laba Bersih Setelah Pajak</span>
                      <span className="font-bold text-white text-2xl">{formatCurrency(labaSetelahPajak)}</span>
                    </div>

                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4 bg-white rounded-b-2xl flex justify-end shrink-0">
                  <button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
      {/* Add Master Modal */}
      {isAddMasterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Tambah Master Entity</h3>
              <button onClick={() => setIsAddMasterModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode (Opsional)</label>
                <input type="text" value={newMasterCode} onChange={e => setNewMasterCode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" value={newMasterName} onChange={e => setNewMasterName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={newMasterStatus} onChange={e => setNewMasterStatus(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 w-full mt-6 pt-4 border-t">
                <button onClick={() => setIsAddMasterModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Batal</button>
                <button onClick={handleAddMaster} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Master Modal */}
      {isEditMasterModalOpen && editingMasterId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Master Entity</h3>
              <button onClick={() => { setIsEditMasterModalOpen(false); setEditingMasterId(null); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode (Opsional)</label>
                <input type="text" value={editMasterCode} onChange={e => setEditMasterCode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" value={editMasterName} onChange={e => setEditMasterName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editMasterStatus} onChange={e => setEditMasterStatus(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 w-full mt-6 pt-4 border-t">
                <button onClick={() => { setIsEditMasterModalOpen(false); setEditingMasterId(null); }} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">Batal</button>
                <button onClick={() => handleUpdateMaster(editingMasterId)} className="flex-1 bg-amber-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
