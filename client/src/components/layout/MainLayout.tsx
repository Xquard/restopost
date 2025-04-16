import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMobile } from '@/hooks/use-mobile';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initializeTheme } from '@/lib/themeToggle';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Initialize theme on component mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Mock user data - in a real app, this would come from an auth context
  const user = {
    fullName: 'Ahmet Yılmaz',
    username: 'ahmet',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };

  // Mock restaurant data - in a real app, this would come from an API
  const restaurant = {
    name: 'İstanbul Cafe',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    membershipType: 'Premium Üyelik'
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    // In a real app, this would call an API to logout
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız",
      duration: 3000,
    });
    navigate('/');
  };

  const handleQuickAction = () => {
    toast({
      title: "Hızlı İşlem",
      description: "Hızlı işlem menüsü açıldı",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header 
        toggleSidebar={handleToggleSidebar} 
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          restaurant={restaurant}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none lg:ml-64 pt-4">
          {children}
        </main>
      </div>
      
      {/* Quick Action Button */}
      <div className="fixed right-6 bottom-6">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={handleQuickAction}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
