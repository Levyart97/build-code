import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Login Berhasil!',
        description: `Selamat datang kembali, ${result.user.username}!`,
        variant: 'default',
      });
      switch (result.user.role) {
        case 'Kabag': navigate('/kabag'); break;
        case 'Monitoring': navigate('/monitoring'); break;
        case 'Staff': navigate('/staff'); break;
        case 'TB': navigate('/tb'); break;
        case 'Admin': navigate('/admin'); break;
        default: navigate('/');
      }
    } else {
      toast({
        title: 'Login Gagal',
        description: result.message || 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl bg-white/10 backdrop-blur-md border-slate-700 text-white">
          <CardHeader className="text-center">
            <motion.h1 
              className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ACTRA
            </motion.h1>
            <CardTitle className="text-3xl font-bold">Selamat Datang</CardTitle>
            <CardDescription className="text-slate-300">
              Silakan masuk untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-white focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-white focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-slate-400 w-full">
              Hubungi administrator jika Anda lupa password.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;