import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Send, Save, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import useAuth from '@/hooks/useAuth';

const sparePartOptions = [
  { value: 'ESC', label: 'ESC (Escrow)' },
  { value: 'UTR', label: 'UTR (Upper Transport Roller)' },
  { value: 'UTF', label: 'UTF (Upper Transport Feeder)' },
  { value: 'BV', label: 'BV (Bill Validator/Acceptor)' },
  { value: 'CS', label: 'CS (Cassette Sensor)' },
  { value: 'TSK', label: 'TSK (Touch Screen Kit)' },
  { value: 'Bucket', label: 'Bucket/Reject Bin' },
  { value: 'LT', label: 'LT (Lower Transport)' },
  { value: 'Kaset', label: 'Kaset Uang' },
  { value: 'Lainnya', label: 'Lainnya (Sebutkan di Note)' },
];

const initialFormData = {
  wsid: '',
  lokasi: '',
  tipe_maintenance: 'PM', 
  pm_selesai: false,
  ada_pergantian_sparepart: false,
  sparepart_diganti: [],
  perlu_request_isi_ulang: false,
  note: '',
};

const TbUpdateMesinPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wsidMaster, setWsidMaster] = useState([]);
  const [isLokasiManual, setIsLokasiManual] = useState(false);
  const [isLoadingWsidMaster, setIsLoadingWsidMaster] = useState(true);

  const fetchWsidMasterData = useCallback(async () => {
    setIsLoadingWsidMaster(true);
    const { data, error } = await supabase.from('master_wsid').select('wsid, lokasi');
    if (error) {
      console.error('Error fetching WSID master:', error);
      toast({ title: "Error", description: "Gagal memuat data master WSID.", variant: "destructive" });
      setWsidMaster([]);
      setIsLokasiManual(true); 
    } else {
      setWsidMaster(data || []);
      setIsLokasiManual(false); 
    }
    setIsLoadingWsidMaster(false);
  }, [toast]);

  useEffect(() => {
    if(user) {
        fetchWsidMasterData();
    }
  }, [user, fetchWsidMasterData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...formData };

    if (type === 'checkbox') {
      newFormData[name] = checked;
      if (name === 'ada_pergantian_sparepart' && !checked) {
        newFormData.sparepart_diganti = []; 
      }
    } else {
      newFormData[name] = value;
    }
    
    if (name === 'wsid') {
      const matchedWsid = wsidMaster.find(item => item.wsid.toLowerCase() === value.toLowerCase());
      if (matchedWsid) {
        newFormData.lokasi = matchedWsid.lokasi;
        setIsLokasiManual(false);
      } else {
        newFormData.lokasi = '';
        setIsLokasiManual(true);
      }
    }
    setFormData(newFormData);
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (selectedValue) => {
    setFormData(prev => {
      const currentValues = prev.sparepart_diganti || [];
      if (currentValues.includes(selectedValue)) {
        return { ...prev, sparepart_diganti: currentValues.filter(v => v !== selectedValue) };
      } else {
        return { ...prev, sparepart_diganti: [...currentValues, selectedValue] };
      }
    });
  };


  const validateForm = () => {
    if (!formData.wsid) {
      toast({ title: "Validasi Gagal", description: "WSID wajib diisi.", variant: "destructive" });
      return false;
    }
    if (isLokasiManual && !formData.lokasi) {
      toast({ title: "Validasi Gagal", description: "Lokasi wajib diisi manual jika WSID tidak ditemukan.", variant: "destructive" });
      return false;
    }
    const matchedWsidInMaster = wsidMaster.find(item => item.wsid.toLowerCase() === formData.wsid.toLowerCase());
    if (!isLokasiManual && !formData.lokasi && matchedWsidInMaster) {
        toast({ title: "Validasi Gagal", description: "Lokasi tidak terisi otomatis. Mohon periksa WSID.", variant: "destructive" });
        return false;
    }
    if (formData.ada_pergantian_sparepart && formData.sparepart_diganti.length === 0) {
      toast({ title: "Validasi Gagal", description: "Pilih minimal satu spare part jika ada pergantian.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user || !user.id) {
      toast({ title: "Error", description: "Sesi pengguna tidak valid. Silakan login ulang.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const maintenanceData = {
      ...formData,
      tb_user_id: user.id,
      tb_username: user.username,
      tanggal_maintenance: new Date().toISOString().split('T')[0],
      jam_maintenance: new Date().toTimeString().split(' ')[0].substring(0,5),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('laporan_maintenance_mesin').insert([maintenanceData]);

    if (error) {
      console.error('Error submitting maintenance report:', error);
      toast({ title: "Gagal Menyimpan", description: `Terjadi kesalahan: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Laporan Tersimpan", description: "Laporan maintenance mesin berhasil disimpan.", variant: "default" });
      setFormData(initialFormData);
      setIsLokasiManual(false);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mt-2 mb-4">
        <Button variant="outline" onClick={() => navigate('/tb')} className="flex items-center shadow-sm hover:shadow-md">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Dashboard TB
        </Button>
      </div>
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Update Maintenance Mesin
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl flex items-center">
              <Settings size={28} className="mr-3" /> Detail Maintenance
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="wsid">WSID <span className="text-red-500">*</span></Label>
                  <Input id="wsid" name="wsid" value={formData.wsid} onChange={handleInputChange} placeholder="Contoh: Z4RA" required className="mt-1" disabled={isLoadingWsidMaster} />
                </div>
                <div>
                  <Label htmlFor="lokasi">Lokasi <span className="text-red-500">*</span></Label>
                  <Input 
                    id="lokasi" 
                    name="lokasi" 
                    value={formData.lokasi} 
                    onChange={handleInputChange} 
                    readOnly={!isLokasiManual && wsidMaster.length > 0} 
                    placeholder={isLoadingWsidMaster ? "Memuat..." : (isLokasiManual ? "Input lokasi manual" : "Otomatis terisi")} 
                    className={`mt-1 ${(!isLokasiManual && wsidMaster.length > 0) ? 'bg-gray-100' : ''}`} 
                    required
                    disabled={isLoadingWsidMaster && !isLokasiManual}
                  />
                  {isLoadingWsidMaster && <p className="text-xs text-blue-600 mt-1">Memeriksa master WSID...</p>}
                  {(!isLoadingWsidMaster && isLokasiManual && formData.wsid) && <p className="text-xs text-orange-600 mt-1">WSID tidak ditemukan di master, input lokasi manual.</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="tipe_maintenance">Tipe Maintenance <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => handleSelectChange('tipe_maintenance', value)} value={formData.tipe_maintenance}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih Tipe Maintenance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PM">PM (Preventive Maintenance)</SelectItem>
                    <SelectItem value="CM">CM (Corrective Maintenance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.tipe_maintenance === 'PM' && (
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox id="pm_selesai" name="pm_selesai" checked={formData.pm_selesai} onCheckedChange={(checked) => handleInputChange({ target: { name: 'pm_selesai', checked, type: 'checkbox' }})} />
                  <Label htmlFor="pm_selesai" className="font-normal">PM Selesai Dilakukan</Label>
                </div>
              )}

              <div className="flex items-center space-x-2 mt-1">
                <Checkbox id="ada_pergantian_sparepart" name="ada_pergantian_sparepart" checked={formData.ada_pergantian_sparepart} onCheckedChange={(checked) => handleInputChange({ target: { name: 'ada_pergantian_sparepart', checked, type: 'checkbox' }})} />
                <Label htmlFor="ada_pergantian_sparepart" className="font-normal">Ada Pergantian Spare Part?</Label>
              </div>

              {formData.ada_pergantian_sparepart && (
                <div>
                  <Label>Spare Part Diganti <span className="text-red-500">*</span></Label>
                   <div className="mt-1 border rounded-md p-2 max-h-40 overflow-y-auto">
                    {sparePartOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`sparepart-${option.value}`}
                          checked={formData.sparepart_diganti.includes(option.value)}
                          onCheckedChange={() => handleMultiSelectChange(option.value)}
                        />
                        <Label htmlFor={`sparepart-${option.value}`} className="font-normal">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.sparepart_diganti.length > 0 && (
                    <div className="mt-2 p-2 border rounded-md bg-gray-50">
                      <p className="text-sm font-medium">Sparepart Terpilih:</p>
                      <ul className="list-disc list-inside text-sm">
                        {formData.sparepart_diganti.map(sp => <li key={sp}>{sparePartOptions.find(o => o.value === sp)?.label || sp}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <Label>Perlu Request Isi Ulang?</Label>
                <div className="flex gap-4 mt-1">
                    <Button type="button" variant={formData.perlu_request_isi_ulang === true ? "default" : "outline"} onClick={() => setFormData(prev => ({...prev, perlu_request_isi_ulang: true}))}>Ya</Button>
                    <Button type="button" variant={formData.perlu_request_isi_ulang === false ? "default" : "outline"} onClick={() => setFormData(prev => ({...prev, perlu_request_isi_ulang: false}))}>Tidak</Button>
                </div>
              </div>

              <div>
                <Label htmlFor="note">Note (Opsional)</Label>
                <Textarea id="note" name="note" value={formData.note} onChange={handleInputChange} placeholder="Catatan tambahan mengenai maintenance..." className="mt-1" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-6 rounded-b-lg">
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg py-3 text-base font-semibold" disabled={isSubmitting || isLoadingWsidMaster}>
                {isLoadingWsidMaster ? 'Memuat Data...' : (isSubmitting ? 'Menyimpan...' : <><Save size={18} className="mr-2" /> Simpan Laporan Maintenance</>)}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default TbUpdateMesinPage;