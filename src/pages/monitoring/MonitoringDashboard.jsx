import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, KeyRound, Users, FileText, BarChart2, History, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const FeatureCard = ({ title, description, icon, actionText, onClick, navigateTo }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </CardContent>
        {actionText && (
           <div className="p-4 pt-0">
            <Button onClick={handleClick} className="w-full">
              {actionText}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

const MonitoringDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Tim Monitoring
      </motion.h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Cek Jadwal Pengisian"
          description="Lihat jadwal pengisian ATM yang telah ditetapkan."
          icon={<CalendarCheck className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat Jadwal"
          onClick={() => alert('Fitur Cek Jadwal Pengisian (Belum Tersedia)')}
        />
        <FeatureCard
          title="Input PIN Cencon"
          description="Masukkan PIN Cencon untuk proses operasional."
          icon={<KeyRound className="h-6 w-6 text-muted-foreground" />}
          actionText="Input PIN"
          onClick={() => alert('Fitur Input PIN Cencon (Belum Tersedia)')}
        />
        <FeatureCard
          title="Cek Tim Pengisian"
          description="Monitor status dan progres tim di lapangan."
          icon={<Users className="h-6 w-6 text-muted-foreground" />}
          actionText="Monitor Tim"
          onClick={() => alert('Fitur Cek Tim Pengisian (Belum Tersedia)')}
        />
        <FeatureCard
          title="Laporan Uang Kejepit"
          description="Akses dan kelola laporan insiden uang kejepit."
          icon={<FileText className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat Laporan"
          navigateTo="/monitoring/laporan-uang-kejepit"
        />
        <FeatureCard
          title="Statistik Mesin (Uang Kejepit)"
          description="Lihat statistik frekuensi uang kejepit per mesin."
          icon={<BarChart3 className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat Statistik"
          navigateTo="/monitoring/statistik-mesin"
        />
        <FeatureCard
          title="History Maintenance Mesin"
          description="Lihat riwayat PM/CM dan penggantian spare part per mesin."
          icon={<History className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat History"
          navigateTo="/monitoring/history-mesin"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <BarChart2 className="mr-2 h-6 w-6" />
              Statistik Operasional (Placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Grafik terkait operasional ATM akan ditampilkan di sini.</p>
            <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart Area</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MonitoringDashboard;