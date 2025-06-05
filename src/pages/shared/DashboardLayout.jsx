import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Home, LogOut, UserCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ navLinks }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const reactRouterLocation = useLocation(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout(() => navigate('/login'));
  };

  const commonLinks = [
    { path: `/${user?.role?.toLowerCase()}`, label: 'Home', icon: <Home size={20} /> },
  ];

  const allLinks = [...commonLinks, ...(navLinks || [])];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };
  
  const backdropVariants = {
    open: { opacity: 1, pointerEvents: "auto" },
    closed: { opacity: 0, pointerEvents: "none" },
  };

  if (!user) { 
    return null; // Atau loading state, atau redirect. Mencegah error jika user null saat render link
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to={`/${user.role.toLowerCase()}`} className="text-xl font-bold hover:opacity-80 transition-opacity">
            Bank Internal Ops
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <UserCircle size={24} />
              <span>{user.username} ({user.role})</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="hidden md:inline-flex hover:bg-primary/80">
              <LogOut size={20} className="mr-2" />
              Keluar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary/80"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-4 md:hidden"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 p-2 border-b mb-4">
                  <UserCircle size={24} className="text-primary" />
                  <span className="font-semibold">{user.username} ({user.role})</span>
                </div>
                {allLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                <Button variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full mt-auto border-primary text-primary hover:bg-primary/10">
                  <LogOut size={20} className="mr-2" />
                  Keluar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <motion.div
          key={reactRouterLocation.pathname} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; {new Date().getFullYear()} Operasional Internal Bank. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;