import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Settings, Wrench as Tool, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/useAuth';

const MonitoringHistoryMesinPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allWsid, setAllWsid] = useState([]);
  const [filteredWsid, setFilteredWsid] = useState([]);
  const [selectedWsid, setSelectedWsid] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loadingWsid, setLoadingWsid] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchAllWsid = useCallback(async () => {
    setLoadingWsid(true);
    // Fetch distinct WSIDs from maintenance reports and master_wsid
    const { data: maintenanceWsids, error: maintError } = await supabase
      .from('laporan_maintenance_mesin')
      .select('wsid, lokasi', { distinct: true });

    const { data: masterWsids, error: masterError } = await supabase
      .from('master_wsid')
      .select('wsid, lokasi');

    if (maintError || masterError) {
      console.error('Error fetching WSID list:', maintError || masterError);
      toast({ title: "Error", description: "Gagal memuat daftar WSID.", variant: "destructive" });
      setAllWsid([]);
      setFilteredWsid([]);
    } else {
      const combined = [...(maintenanceWsids || []), ...(masterWsids || [])];
      const uniqueWsids = Array.from(new Set(combined.map(item => item.wsid)))
        .map(wsid => {
          const itemWithLokasi = combined.find(item => item.wsid === wsid && item.lokasi);
          return { wsid, lokasi: itemWithLokasi?.lokasi || 'Lokasi tidak diketahui' };
        })
        .sort((a, b) => a.wsid.localeCompare(b.wsid));
      
      setAllWsid(uniqueWsids);
      setFilteredWsid(uniqueWsids);
    }
    setLoadingWsid(false);
  }, [toast]);

  useEffect(() => {
    if(user) fetchAllWsid();
  }, [user, fetchAllWsid]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredWsid(allWsid);
    } else {
      setFilteredWsid(
        allWsid.filter(item => 
          item.wsid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allWsid]);

  const fetchMaintenanceHistory = async (wsid) => {
    if (!wsid) return;
    setLoadingHistory(true);
    setSelectedWsid(wsid);

    const { data, error } = await supabase
      .from('laporan_maintenance_mesin')
      .select('*')
      .eq('wsid', wsid)
      .order('tanggal_maintenance', { ascending: false })
      .order('jam_maintenance', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance history:', error);
      toast({ title: "Error", description: `Gagal memuat histori untuk ${wsid}.`, variant: "destructive" });
      setMaintenanceHistory([]);
    } else {
      setMaintenanceHistory(data || []);
    }
    setLoadingHistory(false);
  };
  
  const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  const formatTime = (timeString) => {
     if (!timeString) return '-';
     const parts = timeString.split(':');
     return `${parts[0]}:${parts[1]}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center mt-2 mb-4">
        <Button variant="outline" onClick={() => navigate('/monitoring')} className="flex items-center shadow-sm hover:shadow-md">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Dashboard
        </Button>
      </div>
      <motion.h1 
        className="text-3xl font-bold text-primary text-center flex items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CalendarDays size={32} className="mr-3" /> History Maintenance Mesin
      </motion.h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pencarian WSID</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              type="text"
              placeholder="Ketik WSID atau Lokasi untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loadingWsid && <p className="text-center text-muted-foreground py-4">Memuat daftar WSID...</p>}
          {!loadingWsid && filteredWsid.length === 0 && searchTerm !== '' && (
            <p className="text-center text-muted-foreground py-4">WSID tidak ditemukan.</p>
          )}
          {!loadingWsid && filteredWsid.length === 0 && searchTerm === '' && allWsid.length === 0 && (
             <p className="text-center text-muted-foreground py-4">Belum ada data WSID.</p>
          )}
          {!loadingWsid && filteredWsid.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredWsid.map(item => (
                <Button 
                  key={item.wsid} 
                  variant="outline" 
                  className={`w-full justify-start ${selectedWsid === item.wsid ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                  onClick={() => fetchMaintenanceHistory(item.wsid)}
                >
                  {item.wsid} - {item.lokasi}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWsid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">History untuk {selectedWsid}</CardTitle>
              <CardDescription>{allWsid.find(w => w.wsid === selectedWsid)?.lokasi}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory && <p className="text-center text-muted-foreground py-8">Memuat histori maintenance...</p>}
              {!loadingHistory && maintenanceHistory.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada histori maintenance untuk WSID ini.</p>
              )}
              {!loadingHistory && maintenanceHistory.length > 0 && (
                <div className="space-y-4">
                  {maintenanceHistory.map(log => (
                    <Card key={log.id} className="border rounded-lg overflow-hidden">
                       <CardHeader className="bg-gray-50 dark:bg-gray-800 p-3">
                        <p className="font-semibold text-md">
                          <span className={`font-bold ${log.tipe_maintenance === 'PM' ? 'text-green-600' : 'text-orange-600'}`}>
                            {log.tipe_maintenance}
                          </span> 
                          {' - '} {formatDate(log.tanggal_maintenance)} {formatTime(log.jam_maintenance)}
                        </p>
                        <p className="text-xs text-muted-foreground">Oleh: {log.tb_username}</p>
                      </CardHeader>
                      <CardContent className="p-3 text-sm">
                        {log.tipe_maintenance === 'PM' && <p><strong>PM Selesai:</strong> {log.pm_selesai ? 'Ya' : 'Tidak'}</p>}
                        <p><strong>Ada Ganti Spare Part:</strong> {log.ada_pergantian_sparepart ? 'Ya' : 'Tidak'}</p>
                        {log.ada_pergantian_sparepart && log.sparepart_diganti && log.sparepart_diganti.length > 0 && (
                          <div>
                            <strong>Spare Part Diganti:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {log.sparepart_diganti.map(sp => <li key={sp}>{sp}</li>)}
                            </ul>
                          </div>
                        )}
                        <p><strong>Perlu Isi Ulang:</strong> {log.perlu_request_isi_ulang ? 'Ya' : 'Tidak'}</p>
                        {log.note && <p><strong>Note:</strong> {log.note}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default MonitoringHistoryMesinPage;