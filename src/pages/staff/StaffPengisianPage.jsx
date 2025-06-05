import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Lock as LockOpen, CheckCircle, Unlock, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ActionButton = ({ title, icon, onClick, disabled }) => (
  <motion.div whileTap={{ scale: 0.95 }}>
    <Button 
      onClick={onClick} 
      disabled={disabled}
      className="w-full justify-start p-6 text-left h-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
    >
      {React.cloneElement(icon, { size: 24, className: "mr-4" })}
      <span className="text-lg font-semibold">{title}</span>
    </Button>
  </motion.div>
);

const StaffPengisianPage = () => {
  const navigate = useNavigate();
  // Placeholder states for enabling/disabling buttons based on workflow
  const [barcodeScanned, setBarcodeScanned] = React.useState(false);
  const [cenconOpened, setCenconOpened] = React.useState(false);
  const [barcodeValidated, setBarcodeValidated] = React.useState(false);
  const [cenconClosed, setCenconClosed] = React.useState(false);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Button variant="outline" onClick={() => navigate('/staff')} className="mb-4">
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Menu Staff
      </Button>
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Proses Pengisian ATM
      </motion.h1>
      
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl">Langkah-langkah Pengisian</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <ActionButton
            title="Scan Barcode (CPC)"
            icon={<QrCode />}
            onClick={() => { alert('Fitur Scan Barcode (CPC)'); setBarcodeScanned(true); }}
            disabled={false}
          />
          <ActionButton
            title="Open Cencon"
            icon={<LockOpen />}
            onClick={() => { alert('Fitur Open Cencon'); setCenconOpened(true); }}
            disabled={!barcodeScanned}
          />
          <ActionButton
            title="Validasi Barcode"
            icon={<CheckCircle />}
            onClick={() => { alert('Fitur Validasi Barcode'); setBarcodeValidated(true); }}
            disabled={!cenconOpened}
          />
          <ActionButton
            title="Close Cencon"
            icon={<Unlock />}
            onClick={() => { alert('Fitur Close Cencon'); setCenconClosed(true); }}
            disabled={!barcodeValidated}
          />
          <ActionButton
            title="Foto DC"
            icon={<Camera />}
            onClick={() => alert('Fitur Foto DC')}
            disabled={!cenconClosed}
          />
        </CardContent>
      </Card>
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-muted-foreground">Ikuti langkah-langkah di atas secara berurutan.</p>
      </motion.div>
    </div>
  );
};

export default StaffPengisianPage;