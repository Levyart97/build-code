import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Edit3, Copy, MessageSquare, Download, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const StaffArsipLaporanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [laporanGroupedByDate, setLaporanGroupedByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDateCollapse, setOpenDateCollapse] = useState({});
  const [openReportCollapse, setOpenReportCollapse] = useState({});

  const fetchLaporan = useCallback(async () => {
    if (!user) {
      toast({ title: "Error", description: "User tidak ditemukan. Mohon login ulang.", variant: "destructive" });
      setLoading(false);
      return;
    }

    setLoading(true);
    // The select query now explicitly asks for pic_cencon_username from app_users table
    // through the foreign key relationship.
    // Ensure the foreign key name laporan_uang_kejepit_pic_cencon_user_id_fkey is correct
    // or use the more direct approach if app_users table is directly queried for PIC details later.
    // Given current schema, pic_cencon_username is already in laporan_uang_kejepit.
    // If you want live username from app_users, ensure RLS allows reading app_users.username.
    let query = supabase
      .from('laporan_uang_kejepit')
      .select(`
        id,
        no_amplop,
        wsid,
        lokasi,
        tanggal_bongkar,
        jam_bongkar,
        tanggal_kejadian,
        jam_kejadian,
        denom_100_lembar,
        denom_50_lembar,
        denom_100_total,
        denom_50_total,
        staff_user_id,
        staff_username,
        tb_username,
        pic_cencon_user_id,
        pic_cencon_username, 
        terjepit_di,
        created_at,
        updated_at
      `)
      .order('tanggal_kejadian', { ascending: false })
      .order('created_at', { ascending: false });

    // Client-side filtering based on role for UI convenience.
    // RLS is the main security gatekeeper.
    if (user.role === 'Staff') {
      query = query.eq('staff_user_id', user.id);
    }
    // For Kabag, Monitoring, Admin, no additional client-side filter on user ID is applied,
    // relying on RLS to show appropriate data.

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching laporan:', error);
      toast({ title: "Error", description: `Gagal memuat arsip laporan: ${error.message}`, variant: "destructive" });
      setLaporanGroupedByDate({});
    } else {
      const grouped = (data || []).reduce((acc, report) => {
        const date = formatDate(report.tanggal_kejadian, { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(report);
        return acc;
      }, {});
      setLaporanGroupedByDate(grouped);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            // Try to parse as YYYY-MM-DD if it's just a date string
             const parts = dateString.split('-');
             if (parts.length === 3) {
                 const parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                 if (!isNaN(parsedDate.getTime())) return parsedDate.toLocaleDateString('id-ID', options);
             }
            return 'Invalid Date';
        }
        return date.toLocaleDateString('id-ID', options);
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };
  
  const formatTime = (timeString) => {
     if (!timeString) return '-';
     // Check if timeString contains 'T' which means it might be a full ISO string
     if (timeString.includes('T')) {
         try {
             const date = new Date(timeString);
             if (!isNaN(date.getTime())) {
                 return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
             }
         } catch (e) {
            // Fall through if parsing as Date fails for time part
         }
     }
     // Assuming timeString is "HH:MM:SS" or "HH:MM"
     const parts = String(timeString).split(':');
     if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
     }
     return timeString; // Fallback
  };

  const toggleDateCollapse = (date) => {
    setOpenDateCollapse(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const toggleReportCollapse = (reportId) => {
    setOpenReportCollapse(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const handleEdit = (report) => {
    if (user.role === 'Staff' && user.id === report.staff_user_id) {
      navigate('/staff/laporan-uang-kejepit', { state: { reportData: report } });
    } else {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengedit laporan ini.", variant: "destructive"});
    }
  };

  const handleCopy = (report) => {
    const picUsername = report.pic_cencon_username || '-';
    const textToCopy = `
Laporan Uang Kejepit
------------------------------------
No Amplop: ${report.no_amplop || '-'}
WSID: ${report.wsid}
Lokasi: ${report.lokasi}
------------------------------------
Tgl Bongkar: ${formatDate(report.tanggal_bongkar)} ${formatTime(report.jam_bongkar)}
Tgl Kejadian: ${formatDate(report.tanggal_kejadian)} ${formatTime(report.jam_kejadian)}
------------------------------------
Denom 100: ${report.denom_100_lembar || 0} lbr (${formatCurrency(report.denom_100_total)})
Denom 50: ${report.denom_50_lembar || 0} lbr (${formatCurrency(report.denom_50_total)})
Total Uang Kejepit: ${formatCurrency((report.denom_100_total || 0) + (report.denom_50_total || 0))}
------------------------------------
Staff: ${report.staff_username}
Teknisi (TB): ${report.tb_username || '-'}
PIC Cencon: ${picUsername}
Terjepit di: ${report.terjepit_di}
------------------------------------
Dibuat pada: ${formatDate(report.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}
    `.trim();
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Sukses", description: "Laporan disalin ke clipboard!" }))
      .catch(() => toast({ title: "Error", description: "Gagal menyalin laporan.", variant: "destructive" }));
  };

  const handleWhatsApp = (report) => {
    const picUsername = report.pic_cencon_username || '-';
    const message = `
*Laporan Uang Kejepit*
------------------------------------
*No Amplop:* ${report.no_amplop || '-'}
*WSID:* ${report.wsid}
*Lokasi:* ${report.lokasi}
------------------------------------
*Tgl Bongkar:* ${formatDate(report.tanggal_bongkar)} ${formatTime(report.jam_bongkar)}
*Tgl Kejadian:* ${formatDate(report.tanggal_kejadian)} ${formatTime(report.jam_kejadian)}
------------------------------------
*Denom 100:* ${report.denom_100_lembar || 0} lbr (${formatCurrency(report.denom_100_total)})
*Denom 50:* ${report.denom_50_lembar || 0} lbr (${formatCurrency(report.denom_50_total)})
*Total Uang Kejepit:* ${formatCurrency((report.denom_100_total || 0) + (report.denom_50_total || 0))}
------------------------------------
*Staff:* ${report.staff_username}
*Teknisi (TB):* ${report.tb_username || '-'}
*PIC Cencon:* ${picUsername}
*Terjepit di:* ${report.terjepit_di}
------------------------------------
*Dibuat pada:* ${formatDate(report.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}
    `.trim();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleDownload = (report) => {
    toast({title: "Info", description: "Fitur download canggih sedang dipersiapkan. Untuk saat ini, Anda bisa menyalin teksnya."});
    const picUsername = report.pic_cencon_username || '-';
    const content = `
Laporan Uang Kejepit
------------------------------------
No Amplop: ${report.no_amplop || '-'}
WSID: ${report.wsid}
Lokasi: ${report.lokasi}
Tgl Bongkar: ${formatDate(report.tanggal_bongkar)} ${formatTime(report.jam_bongkar)}
Tgl Kejadian: ${formatDate(report.tanggal_kejadian)} ${formatTime(report.jam_kejadian)}
Denom 100: ${report.denom_100_lembar || 0} lbr (${formatCurrency(report.denom_100_total)})
Denom 50: ${report.denom_50_lembar || 0} lbr (${formatCurrency(report.denom_50_total)})
Total: ${formatCurrency((report.denom_100_total || 0) + (report.denom_50_total || 0))}
Staff: ${report.staff_username}
TB: ${report.tb_username || '-'}
PIC Cencon: ${picUsername}
Terjepit di: ${report.terjepit_di}
Dibuat: ${formatDate(report.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}
    `.trim();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Uang_Kejepit_${report.wsid}_${report.tanggal_kejadian}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'Staff': return '/staff';
      case 'Kabag': return '/kabag';
      case 'Monitoring': return '/monitoring';
      case 'Admin': return '/admin';
      default: return '/login';
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 mt-2">
        <Button variant="outline" onClick={() => navigate(getDashboardPath())} className="flex items-center shadow-sm hover:shadow-md">
          <ArrowLeft size={16} className="mr-2" /> Kembali ke Dashboard
        </Button>
        <div className="flex items-center gap-2">
          {user && user.role === 'Staff' && (
            <Button onClick={() => navigate('/staff/laporan-uang-kejepit')} className="flex items-center shadow-md bg-green-600 hover:bg-green-700 text-white">
              <PlusCircle size={16} className="mr-2" /> Buat Laporan Baru
            </Button>
          )}
          <Button variant="outline" onClick={fetchLaporan} disabled={loading} className="flex items-center shadow-sm hover:shadow-md">
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Muat Ulang
          </Button>
        </div>
      </div>
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Arsip Laporan Uang Kejepit
      </motion.h1>

      {loading && <p className="text-center text-muted-foreground py-8">Memuat data laporan...</p>}
      {!loading && Object.keys(laporanGroupedByDate).length === 0 && (
        <p className="text-center text-muted-foreground py-8">Belum ada laporan yang ditemukan.</p>
      )}

      {!loading && Object.keys(laporanGroupedByDate).map((dateKey, dateIndex) => (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: dateIndex * 0.05 }}
          className="mb-6"
        >
          <Card className="shadow-md border-primary/20">
            <CardHeader 
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-t-lg cursor-pointer flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toggleDateCollapse(dateKey)}
            >
              <CardTitle className="text-xl text-primary">{dateKey}</CardTitle>
              {openDateCollapse[dateKey] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </CardHeader>
            <AnimatePresence>
              {openDateCollapse[dateKey] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <CardContent className="p-0">
                    {laporanGroupedByDate[dateKey].map((report, reportIndex) => (
                      <div key={report.id} className="border-b last:border-b-0 dark:border-gray-700">
                        <div 
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => toggleReportCollapse(report.id)}
                        >
                          <div>
                            <p className="font-semibold text-primary">{report.wsid} <span className="text-sm text-gray-600 dark:text-gray-400">({report.lokasi})</span></p>
                            <p className="text-xs text-muted-foreground">Oleh: {report.staff_username} - No Amplop: {report.no_amplop || '-'}</p>
                          </div>
                          {openReportCollapse[report.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        <AnimatePresence>
                          {openReportCollapse[report.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                                <div><strong>Tgl Bongkar:</strong> {formatDate(report.tanggal_bongkar)} {formatTime(report.jam_bongkar)}</div>
                                <div><strong>Tgl Kejadian:</strong> {formatDate(report.tanggal_kejadian)} {formatTime(report.jam_kejadian)}</div>
                                <div><strong>Denom 100:</strong> {report.denom_100_lembar || 0} lbr ({formatCurrency(report.denom_100_total)})</div>
                                <div><strong>Denom 50:</strong> {report.denom_50_lembar || 0} lbr ({formatCurrency(report.denom_50_total)})</div>
                                <div className="font-semibold"><strong>Total Kejepit:</strong> {formatCurrency((report.denom_100_total || 0) + (report.denom_50_total || 0))}</div>
                                <div><strong>Teknisi (TB):</strong> {report.tb_username || '-'}</div>
                                <div><strong>PIC Cencon:</strong> {report.pic_cencon_username || '-'}</div>
                                <div className="md:col-span-2"><strong>Terjepit di:</strong> {report.terjepit_di}</div>
                                <div className="md:col-span-2 text-xs text-gray-500"><strong>Dibuat:</strong> {formatDate(report.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} | <strong>Diperbarui:</strong> {formatDate(report.updated_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                              <CardFooter className="p-0 pt-4 flex flex-wrap gap-2 justify-end">
                                {user && user.role === 'Staff' && user.id === report.staff_user_id && (
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(report)} className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-600/20">
                                    <Edit3 size={14} className="mr-1.5" /> Edit
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleCopy(report)} className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-600/20">
                                  <Copy size={14} className="mr-1.5" /> Salin Teks
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleWhatsApp(report)} className="text-teal-600 border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-600/20">
                                  <MessageSquare size={14} className="mr-1.5" /> Kirim WA
                                </Button>
                                 {(user && (user.role === 'Monitoring' || user.role === 'Kabag' || user.role === 'Admin')) && (
                                    <Button variant="outline" size="sm" onClick={() => handleDownload(report)} className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-600/20">
                                        <Download size={14} className="mr-1.5" /> Download Teks
                                    </Button>
                                )}
                              </CardFooter>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StaffArsipLaporanPage;
