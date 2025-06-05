import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeySquare, Image, Image as Images, FileText, BarChart2, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ title, description, icon, actionText, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {actionText && onClick && (
          <Button onClick={onClick} className="w-full">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Administrator
      </motion.h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Input Passthrough Segel"
          description="Masukkan data passthrough segel ATM."
          icon={<KeySquare className="h-6 w-6 text-muted-foreground" />}
          actionText="Input Segel"
          onClick={() => alert('Fitur Input Passthrough Segel')}
        />
        <FeatureCard
          title="Laporan Foto DC"
          description="Lihat dan kelola laporan foto Document Counter."
          icon={<Image className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat Laporan DC"
          onClick={() => alert('Fitur Laporan Foto DC')}
        />
        <FeatureCard
          title="Laporan Foto Kartu"
          description="Akses laporan foto kartu yang bermasalah."
          icon={<Images className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat Laporan Kartu"
          onClick={() => alert('Fitur Laporan Foto Kartu')}
        />
        <FeatureCard
          title="Laporan Uang Kejepit"
          description="Kelola semua laporan insiden uang kejepit."
          icon={<FileText className="h-6 w-6 text-muted-foreground" />}
          actionText="Lihat Laporan Uang Kejepit"
          onClick={() => alert('Fitur Laporan Uang Kejepit')}
        />
         <FeatureCard
          title="QR/Barcode Generator"
          description="Buat QR code atau barcode untuk keperluan internal."
          icon={<QrCode className="h-6 w-6 text-muted-foreground" />}
          actionText="Buat Kode"
          onClick={() => alert('Fitur QR/Barcode Generator')}
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
              Statistik Sistem (Placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Diagram dan grafik terkait keseluruhan sistem akan ditampilkan di sini.</p>
            <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart Area</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;