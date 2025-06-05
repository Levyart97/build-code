import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { ArrowLeft, Send, FileArchive, Edit3, CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import useAuth from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialFormData = (username) => ({
  no_amplop: '',
  wsid: '',
  lokasi: '',
  tanggal_bongkar: '',
  jam_bongkar: '',
  tanggal_kejadian: '',
  jam_kejadian: '',
  denom_100_lembar: '', 
  denom_50_lembar: '',  
  staff_username: username || '',
  tb_username: '',
  pic_cencon_user_id: null, 
  pic_cencon_username: '',
  terjepit_di: '',
});

const StaffLaporanUangKejepitPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState(initialFormData(user?.username));
  const [monitoringUsers, setMonitoringUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wsidMaster, setWsidMaster] = useState([]);
  const [wsidMasterError, setWsidMasterError] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [existingReportId, setExistingReportId] = useState(null);
  const [isLokasiManual, setIsLokasiManual] = useState(false);
  const [isLoadingWsidMaster, setIsLoadingWsidMaster] = useState(true);


  useEffect(() => {
    if (user && user.username && formData.staff_username === '') {
        setFormData(prev => ({ ...prev, staff_username: user.username }));
    }
    if (location.state?.reportData) {
      const report = location.state.reportData;
      setFormData({
        no_amplop: report.no_amplop || '',
        wsid: report.wsid || '',
        lokasi: report.lokasi || '',
        tanggal_bongkar: report.tanggal_bongkar || '',
        jam_bongkar: report.jam_bongkar || '',
        tanggal_kejadian: report.tanggal_kejadian || '',
        jam_kejadian: report.jam_kejadian || '',
        denom_100_lembar: report.denom_100_lembar !== null ? String(report.denom_100_lembar) : '',
        denom_50_lembar: report.denom_50_lembar !== null ? String(report.denom_50_lembar) : '',
        staff_username: report.staff_username || user?.username || '',
        tb_username: report.tb_username || '',
        pic_cencon_user_id: report.pic_cencon_user_id || null,
        pic_cencon_username: report.pic_cencon_username || '',
        terjepit_di: report.terjepit_di || '',
      });
      setExistingReportId(report.id);
    } else {
      setFormData(initialFormData(user?.username)); 
      setExistingReportId(null);
      setIsLokasiManual(false);
    }
  }, [location.state, user]); 

  const fetchWsidMasterData = useCallback(async () => {
    setIsLoadingWsidMaster(true);
    setWsidMasterError(null);
    const { data: wsidData, error: wsidError } = await supabase.from('master_wsid').select('wsid, lokasi');
    
    if (wsidError) {
      console.error('Error fetching WSID master:', wsidError);
      setWsidMasterError(wsidError.message);
      if (wsidError.message.includes("relation \"public.master_wsid\" does not exist")) {
          toast({ title: "Kesalahan Database Kritis", description: "Tabel master_wsid tidak ditemukan. Silakan hubungi administrator SEGERA. Input lokasi akan manual.", variant: "destructive", duration: 10000});
      } else {
          toast({ title: "Error Master WSID", description: `Gagal memuat data master WSID: ${wsidError.message}`, variant: "destructive", duration: 7000 });
      }
      setWsidMaster([]);
      setIsLokasiManual(true); 
    } else {
      setWsidMaster(wsidData || []);
      const currentWsid = location.state?.reportData?.wsid || formData.wsid;
      if (currentWsid) {
        const matchedWsid = (wsidData || []).find(item => item.wsid.toLowerCase() === currentWsid.toLowerCase());
        if (matchedWsid) {
          setFormData(prev => ({ ...prev, lokasi: matchedWsid.lokasi }));
          setIsLokasiManual(false);
        } else {
          if (!location.state?.reportData?.lokasi) {
             setFormData(prev => ({ ...prev, lokasi: '' }));
          }
          setIsLokasiManual(true);
        }
      } else {
         setIsLokasiManual(false); 
      }
    }
    setIsLoadingWsidMaster(false);
  }, [toast, location.state, formData.wsid]); 


  useEffect(() => {
    const fetchMonitoringUsers = async () => {
      if (!user) return; 
      const { data: monUsers, error: monError } = await supabase
        .from('app_users')
        .select('id, username') 
        .eq('role', 'Monitoring'); 
      if (monError) {
        console.error('Error fetching monitoring users:', monError);
        toast({ title: "Error", description: `Gagal memuat daftar PIC Cencon: ${monError.message}`, variant: "destructive" });
      } else {
        setMonitoringUsers(monUsers || []);
      }
    };
    if(user) { 
      fetchMonitoringUsers();
      fetchWsidMasterData(); 
    }
  }, [user, toast, fetchWsidMasterData]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'wsid') {
      if (wsidMaster.length > 0 && !wsidMasterError) { 
        const matchedWsid = wsidMaster.find(item => item.wsid.toLowerCase() === value.toLowerCase());
        if (matchedWsid) {
          newFormData.lokasi = matchedWsid.lokasi;
          setIsLokasiManual(false);
        } else {
          newFormData.lokasi = ''; 
          setIsLokasiManual(true);
        }
      } else { 
        newFormData.lokasi = '';
        setIsLokasiManual(true); 
      }
    }
    
    if (name === 'denom_100_lembar' || name === 'denom_50_lembar') {
      if (value === '' || /^\d+$/.test(value)) { 
        newFormData[name] = value;
      } else {
        return; 
      }
    }
    setFormData(newFormData);
  };

  const handleSelectChange = (name, value) => {
    let picUsername = formData.pic_cencon_username;
    const actualValue = value === "null_value_placeholder" ? null : value;

    if (name === 'pic_cencon_user_id' && actualValue) {
      const selectedPic = monitoringUsers.find(u => u.id === actualValue);
      picUsername = selectedPic ? selectedPic.username : '';
    } else if (name === 'pic_cencon_user_id' && !actualValue) {
        picUsername = '';
    }
    setFormData(prev => ({ ...prev, [name]: actualValue, pic_cencon_username: picUsername }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const denom100Lembar = formData.denom_100_lembar === '' ? 0 : parseInt(formData.denom_100_lembar, 10) || 0;
  const denom50Lembar = formData.denom_50_lembar === '' ? 0 : parseInt(formData.denom_50_lembar, 10) || 0;

  const validateForm = () => {
    if (!formData.wsid) {
      toast({ title: "Validasi Gagal", description: "WSID wajib diisi.", variant: "destructive" });
      return false;
    }
    if (isLokasiManual && !formData.lokasi) {
      toast({ title: "Validasi Gagal", description: "Lokasi wajib diisi manual jika WSID tidak ditemukan atau master data bermasalah.", variant: "destructive" });
      return false;
    }
    const matchedWsidInMaster = wsidMaster.find(item => item.wsid.toLowerCase() === formData.wsid.toLowerCase());
    if (!isLokasiManual && !formData.lokasi && matchedWsidInMaster && wsidMaster.length > 0) {
        toast({ title: "Validasi Gagal", description: "Lokasi tidak terisi otomatis. Mohon periksa WSID atau coba lagi. Jika master WSID baru saja diperbarui, coba refresh halaman.", variant: "destructive", duration: 7000 });
        return false;
    }
    if (!formData.tanggal_bongkar || !formData.jam_bongkar || !formData.tanggal_kejadian || !formData.jam_kejadian) {
      toast({ title: "Validasi Gagal", description: "Tanggal dan Jam (Bongkar & Kejadian) wajib diisi.", variant: "destructive" });
      return false;
    }
     if (!formData.terjepit_di) {
      toast({ title: "Validasi Gagal", description: "Field 'Terjepit di' wajib diisi.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (wsidMasterError && !isLokasiManual && wsidMaster.length > 0) { 
        toast({ title: "Peringatan Master WSID", description: "Ada masalah dengan data master WSID. Jika WSID baru, pastikan input lokasi manual.", variant: "destructive", duration: 7000 });
    }
    if (validateForm()) {
      setShowReviewDialog(true);
    }
  };

  const processSubmit = async () => {
    setShowReviewDialog(false);
    if (!user || !user.id || !user.role) {
      toast({ title: "Error", description: "Sesi pengguna tidak valid atau role tidak diketahui. Silakan login ulang.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (user.role !== 'Staff') {
        toast({ title: "Akses Ditolak", description: "Hanya Staff yang dapat mengirim laporan uang kejepit.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    setIsSubmitting(true);

    const reportData = {
      no_amplop: formData.no_amplop || null,
      wsid: formData.wsid.toUpperCase(), 
      lokasi: formData.lokasi,
      tanggal_bongkar: formData.tanggal_bongkar,
      jam_bongkar: formData.jam_bongkar,
      tanggal_kejadian: formData.tanggal_kejadian,
      jam_kejadian: formData.jam_kejadian,
      denom_100_lembar: denom100Lembar,
      denom_50_lembar: denom50Lembar,
      staff_user_id: user.id, 
      staff_username: user.username, 
      tb_username: formData.tb_username || null,
      pic_cencon_user_id: formData.pic_cencon_user_id, 
      pic_cencon_username: formData.pic_cencon_username || null,
      terjepit_di: formData.terjepit_di,
      updated_at: new Date().toISOString(),
    };

    let error;
    
    if (existingReportId) {
      const { error: updateError } = await supabase.from('laporan_uang_kejepit').update(reportData).eq('id', existingReportId).select();
      error = updateError;
    } else {
      reportData.created_at = new Date().toISOString();
      const { error: insertError } = await supabase.from('laporan_uang_kejepit').insert([reportData]).select();
      error = insertError;
    }

    if (error) {
      console.error('Error submitting report:', error);
      toast({ title: "Gagal Mengirim", description: `Terjadi kesalahan: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: existingReportId ? "Laporan Diperbarui" : "Laporan Terkirim", description: "Data berhasil disimpan.", variant: "default" });
      setFormData(initialFormData(user?.username));
      setExistingReportId(null);
      setIsLokasiManual(false);
      navigate('/staff/laporan-uang-kejepit/arsip');
    }
    setIsSubmitting(false);
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mt-2 mb-4">
        <Button variant="outline" onClick={() => navigate(existingReportId ? '/staff/laporan-uang-kejepit/arsip' :'/staff')} className="flex items-center shadow-sm hover:shadow-md">
          <ArrowLeft size={16} className="mr-2" /> {existingReportId ? 'Kembali ke Arsip' : 'Kembali'}
        </Button>
        {!existingReportId && (
        <Button variant="outline" onClick={() => navigate('/staff/laporan-uang-kejepit/arsip')} className="flex items-center shadow-sm hover:shadow-md">
          <FileArchive size={16} className="mr-2" /> Lihat Arsip Laporan
        </Button>
        )}
      </div>
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {existingReportId ? 'Edit Laporan Uang Kejepit' : 'Formulir Laporan Uang Kejepit'}
      </motion.h1>

      {wsidMasterError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 flex items-center"
          role="alert"
        >
          <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
          <div>
            <span className="font-medium">Peringatan Database:</span> {wsidMasterError.includes("relation \"public.master_wsid\" does not exist") 
            ? "Tabel master_wsid tidak ditemukan. Silakan hubungi admin. Input lokasi akan manual."
            : "Gagal memuat master WSID. Input lokasi mungkin perlu dilakukan manual."}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl">{existingReportId ? 'Edit Detail Laporan' : 'Detail Laporan'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleReviewSubmit}>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label htmlFor="no_amplop">No Amplop (Opsional)</Label>
                <Input id="no_amplop" name="no_amplop" value={formData.no_amplop} onChange={handleInputChange} placeholder="Nomor pada amplop" className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="wsid">WSID <span className="text-red-500">*</span></Label>
                  <Input id="wsid" name="wsid" value={formData.wsid} onChange={handleInputChange} placeholder="Contoh: Z4RA" required className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" disabled={false} />
                </div>
                <div>
                  <Label htmlFor="lokasi">Lokasi <span className="text-red-500">*</span></Label>
                  <Input 
                    id="lokasi" 
                    name="lokasi" 
                    value={formData.lokasi} 
                    onChange={handleInputChange} 
                    readOnly={!isLokasiManual && wsidMaster.length > 0 && !wsidMasterError} 
                    placeholder={(isLokasiManual || wsidMasterError || wsidMaster.length === 0) ? "Input lokasi manual" : (isLoadingWsidMaster ? "Memuat..." : "Otomatis terisi")} 
                    className={`mt-1 border-gray-300 focus:border-primary focus:ring-primary ${(!isLokasiManual && wsidMaster.length > 0 && !wsidMasterError) ? 'bg-gray-100' : ''}`} 
                    required
                    disabled={isLoadingWsidMaster && !isLokasiManual}
                  />
                   {(isLokasiManual || (wsidMasterError && !isLoadingWsidMaster && wsidMaster.length === 0 )) && <p className="text-xs text-orange-600 mt-1">WSID tidak ditemukan di master atau master bermasalah, silakan input lokasi manual.</p>}
                   {isLoadingWsidMaster && <p className="text-xs text-blue-600 mt-1">Memeriksa master WSID...</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="tanggal_bongkar">Tanggal Bongkar <span className="text-red-500">*</span></Label>
                  <Input id="tanggal_bongkar" name="tanggal_bongkar" type="date" value={formData.tanggal_bongkar} onChange={handleInputChange} required className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
                </div>
                <div>
                  <Label htmlFor="jam_bongkar">Jam Bongkar <span className="text-red-500">*</span></Label>
                  <Input id="jam_bongkar" name="jam_bongkar" type="time" value={formData.jam_bongkar} onChange={handleInputChange} required className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="tanggal_kejadian">Tanggal Kejadian <span className="text-red-500">*</span></Label>
                  <Input id="tanggal_kejadian" name="tanggal_kejadian" type="date" value={formData.tanggal_kejadian} onChange={handleInputChange} required className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
                </div>
                <div>
                  <Label htmlFor="jam_kejadian">Jam Kejadian <span className="text-red-500">*</span></Label>
                  <Input id="jam_kejadian" name="jam_kejadian" type="time" value={formData.jam_kejadian} onChange={handleInputChange} required className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="denom_100_lembar">Denom 100 (Lembar)</Label>
                  <Input id="denom_100_lembar" name="denom_100_lembar" type="text" inputMode="numeric" pattern="\d*" value={formData.denom_100_lembar} onChange={handleInputChange} placeholder="Jumlah lembar" className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
                  <p className="text-sm text-muted-foreground mt-1">{denom100Lembar} lembar &rarr; {formatCurrency(denom100Lembar * 100000)}</p>
                </div>
                <div>
                  <Label htmlFor="denom_50_lembar">Denom 50 (Lembar)</Label>
                  <Input id="denom_50_lembar" name="denom_50_lembar" type="text" inputMode="numeric" pattern="\d*" value={formData.denom_50_lembar} onChange={handleInputChange} placeholder="Jumlah lembar" className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
                  <p className="text-sm text-muted-foreground mt-1">{denom50Lembar} lembar &rarr; {formatCurrency(denom50Lembar * 50000)}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="staff_username">Staff (Pelapor)</Label>
                <Input id="staff_username" name="staff_username" value={formData.staff_username} readOnly className="mt-1 bg-gray-100 border-gray-300" />
              </div>
              <div>
                <Label htmlFor="tb_username">TB (Teknisi)</Label>
                <Input id="tb_username" name="tb_username" value={formData.tb_username} onChange={handleInputChange} placeholder="Nama Teknisi (jika ada)" className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <Label htmlFor="pic_cencon_user_id">PIC Cencon</Label>
                <Select 
                    onValueChange={(value) => handleSelectChange('pic_cencon_user_id', value)} 
                    value={formData.pic_cencon_user_id === null ? "null_value_placeholder" : formData.pic_cencon_user_id}
                >
                  <SelectTrigger className="w-full mt-1 border-gray-300 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Pilih PIC Cencon (jika ada)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null_value_placeholder">Tidak Ada</SelectItem>
                    {monitoringUsers.map(monUser => (
                      <SelectItem key={monUser.id} value={monUser.id}>
                        {monUser.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="terjepit_di">Terjepit di <span className="text-red-500">*</span></Label>
                <Textarea id="terjepit_di" name="terjepit_di" value={formData.terjepit_di} onChange={handleInputChange} placeholder="Deskripsikan lokasi uang terjepit (misal: Escrow, Stacker, dll.)" required className="mt-1 border-gray-300 focus:border-primary focus:ring-primary" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-6 rounded-b-lg">
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg py-3 text-base font-semibold" disabled={isSubmitting || isLoadingWsidMaster}>
                {isLoadingWsidMaster ? 'Memuat Data Master...' : (isSubmitting ? 'Memproses...' : (existingReportId ? <><Save size={18} className="mr-2" /> Simpan Perubahan</> : <><Send size={18} className="mr-2" /> Review & Kirim Laporan</>))}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center">
              <CheckCircle size={28} className="mr-3 text-green-500" />
              Review Laporan Anda
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-700 pt-2">
              Pastikan semua data yang Anda masukkan sudah benar sebelum mengirim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 space-y-2 text-sm max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-md">
            <p><strong>No Amplop:</strong> {formData.no_amplop || '-'}</p>
            <p><strong>WSID:</strong> {formData.wsid.toUpperCase()}</p>
            <p><strong>Lokasi:</strong> {formData.lokasi}</p>
            <p><strong>Tgl Bongkar:</strong> {formData.tanggal_bongkar} {formData.jam_bongkar}</p>
            <p><strong>Tgl Kejadian:</strong> {formData.tanggal_kejadian} {formData.jam_kejadian}</p>
            <p><strong>Denom 100:</strong> {denom100Lembar} lbr ({formatCurrency(denom100Lembar * 100000)})</p>
            <p><strong>Denom 50:</strong> {denom50Lembar} lbr ({formatCurrency(denom50Lembar * 50000)})</p>
            <p><strong>Staff:</strong> {formData.staff_username}</p>
            <p><strong>TB:</strong> {formData.tb_username || '-'}</p>
            <p><strong>PIC Cencon:</strong> {formData.pic_cencon_username || '-'}</p>
            <p><strong>Terjepit di:</strong> {formData.terjepit_di}</p>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => setShowReviewDialog(false)}>
                <Edit3 size={16} className="mr-2" /> Edit Lagi
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={processSubmit} className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : <><Send size={16} className="mr-2" /> Ya, Kirim Sekarang</>}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default StaffLaporanUangKejepitPage;