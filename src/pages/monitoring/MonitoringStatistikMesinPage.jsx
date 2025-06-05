import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Ditambahkan impor Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { ArrowLeft, BarChart3, AlertTriangle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/useAuth';

const MonitoringStatistikMesinPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all_time'); // daily, monthly, all_time
  const [kejadianData, setKejadianData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWsid, setExpandedWsid] = useState(null);

  const fetchKejadianData = useCallback(async () => {
    setLoading(true);
    let startDate, endDate;
    const now = new Date();

    if (filter === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    } else if (filter === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    }

    let query = supabase
      .from('laporan_uang_kejepit')
      .select('id, wsid, lokasi, tanggal_kejadian, staff_username, terjepit_di, denom_100_total, denom_50_total, created_at');

    if (filter !== 'all_time') {
      query = query.gte('tanggal_kejadian', startDate.split('T')[0]).lte('tanggal_kejadian', endDate.split('T')[0]);
    }
    
    query = query.order('tanggal_kejadian', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching kejadian data:', error);
      toast({ title: "Error", description: "Gagal memuat data statistik.", variant: "destructive" });
      setKejadianData([]);
    } else {
      // Group by WSID and count occurrences
      const groupedByWsid = (data || []).reduce((acc, curr) => {
        acc[curr.wsid] = acc[curr.wsid] || { wsid: curr.wsid, lokasi: curr.lokasi, count: 0, reports: [] };
        acc[curr.wsid].count++;
        acc[curr.wsid].reports.push(curr);
        return acc;
      }, {});
      
      const sortedData = Object.values(groupedByWsid).sort((a, b) => b.count - a.count);
      setKejadianData(sortedData);
    }
    setLoading(false);
  }, [filter, toast]);

  useEffect(() => {
    if (user) { // Ensure user is loaded before fetching
        fetchKejadianData();
    }
  }, [user, fetchKejadianData]);

  const toggleWsidDetails = (wsid) => {
    setExpandedWsid(expandedWsid === wsid ? null : wsid);
  };
  
  const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
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
        <BarChart3 size={32} className="mr-3" /> Statistik Mesin (Uang Kejepit)
      </motion.h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Filter Statistik</CardTitle>
          <div className="flex items-center space-x-4 mt-2">
            <Label htmlFor="filter-kejadian" className="text-sm font-medium">Periode:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger id="filter-kejadian" className="w-[180px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian Ini</SelectItem>
                <SelectItem value="monthly">Bulanan Ini</SelectItem>
                <SelectItem value="all_time">Semua Waktu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center text-muted-foreground py-8">Memuat statistik...</p>}
          {!loading && kejadianData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Tidak ada data kejadian untuk periode ini.</p>
          )}
          {!loading && kejadianData.length > 0 && (
            <div className="space-y-3">
              {kejadianData.map((item, index) => (
                <motion.div
                  key={item.wsid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border rounded-lg overflow-hidden">
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => toggleWsidDetails(item.wsid)}
                    >
                      <div className="flex items-center">
                        <span className="font-bold text-primary mr-3 text-lg">{index + 1}.</span>
                        <div>
                          <p className="font-semibold text-lg">{item.wsid} <span className="text-sm text-gray-600 dark:text-gray-400">({item.lokasi})</span></p>
                          <p className="text-sm text-red-500 flex items-center">
                            <AlertTriangle size={14} className="mr-1" /> {item.count} Kejadian
                          </p>
                        </div>
                      </div>
                      {expandedWsid === item.wsid ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    <AnimatePresence>
                      {expandedWsid === item.wsid && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t"
                        >
                          <h4 className="font-semibold mb-2 text-md">Detail Kejadian:</h4>
                          <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {item.reports.map(report => (
                              <li key={report.id} className="text-xs p-2 border rounded bg-white dark:bg-gray-800">
                                <p><strong>Tanggal:</strong> {formatDate(report.tanggal_kejadian)}</p>
                                <p><strong>Staff:</strong> {report.staff_username}</p>
                                <p><strong>Terjepit di:</strong> {report.terjepit_di}</p>
                                <p><strong>Total Kejepit:</strong> {formatCurrency(report.denom_100_total + report.denom_50_total)}</p>
                                <p className="text-gray-500 text-[10px]">ID Laporan: {report.id}</p>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringStatistikMesinPage;