import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, FileImage, FileText, BarChart2, Settings } from 'lucide-react';
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

const TbDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Teknisi Bongkar (TB)
      </motion.h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Update Maintenance Mesin"
          description="Laporkan PM atau CM, termasuk penggantian spare part."
          icon={<Settings className="h-6 w-6 text-muted-foreground" />}
          actionText="Buat Laporan Maintenance"
          navigateTo="/tb/update-mesin"
        />
        <FeatureCard
          title="Foto DC"
          description="Unggah foto Document Counter."
          icon={<Camera className="h-6 w-6 text-muted-foreground" />}
          actionText="Unggah Foto DC"
          onClick={() => alert('Fitur Foto DC (Belum Tersedia)')}
        />
        <FeatureCard
          title="Foto Kartu"
          description="Unggah foto kartu yang tertinggal/bermasalah."
          icon={<FileImage className="h-6 w-6 text-muted-foreground" />}
          actionText="Unggah Foto Kartu"
          onClick={() => alert('Fitur Foto Kartu (Belum Tersedia)')}
        />
        <FeatureCard
          title="Document Counter"
          description="Input data dari Document Counter."
          icon={<FileText className="h-6 w-6 text-muted-foreground" />}
          actionText="Input Data Counter"
          onClick={() => alert('Fitur Document Counter (Belum Tersedia)')}
        />
        <FeatureCard
          title="Laporan Uang Kejepit"
          description="Buat atau lihat laporan insiden uang kejepit (jika diperlukan)."
          icon={<FileText className="h-6 w-6 text-muted-foreground" />} 
          actionText="Laporan Uang Kejepit"
          onClick={() => alert('Fitur Laporan Uang Kejepit (Belum Tersedia untuk TB)')}
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
              Statistik Pekerjaan (Placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Grafik terkait pekerjaan teknisi akan ditampilkan di sini.</p>
            <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart Area</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TbDashboard;