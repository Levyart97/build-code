import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertTriangle, QrCode, Lock as LockOpen, CheckCircle, Unlock, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const ActionCard = ({ title, description, icon, onClick, bgColor = 'bg-primary' }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
    transition={{ type: "spring", stiffness: 300 }}
    className="cursor-pointer"
    onClick={onClick}
  >
    <Card className={`${bgColor} text-primary-foreground hover:opacity-90 transition-opacity`}>
      <CardHeader>
        <CardTitle className="flex flex-col items-center text-center space-y-2">
          {React.cloneElement(icon, { size: 40, className: "mb-2" })}
          <span className="text-xl">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm opacity-90">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const StaffDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Menu Petugas Lapangan (Staff)
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <ActionCard
          title="Pengisian ATM"
          description="Mulai proses pengisian ATM."
          icon={<DollarSign />}
          onClick={() => navigate('/staff/pengisian')}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <ActionCard
          title="Laporan Uang Kejepit"
          description="Buat laporan insiden uang kejepit."
          icon={<AlertTriangle />}
          onClick={() => navigate('/staff/laporan-uang-kejepit')}
          bgColor="bg-gradient-to-br from-orange-500 to-orange-700"
        />
      </div>
      
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-muted-foreground">Pilih salah satu menu di atas untuk memulai.</p>
      </motion.div>
    </div>
  );
};

export default StaffDashboard;