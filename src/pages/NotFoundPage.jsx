import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-700 text-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="text-center"
      >
        <AlertTriangle size={96} className="mx-auto mb-8 text-yellow-300" />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-6">Halaman Tidak Ditemukan</h2>
        <p className="text-lg mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
          <Link to="/">Kembali ke Halaman Utama</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;