import { useState } from 'react';
import { Bell, Sun, Moon, ChevronDown, Menu } from 'lucide-react';
import { toggleDarkMode } from '@/lib/themeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  toggleSidebar: () => void;
  user: {
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
}

export function Header({ toggleSidebar, user, onLogout }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const { toast } = useToast();

  const handleThemeToggle = () => {
    const newIsDark = toggleDarkMode();
    setIsDark(newIsDark);
  };

  const handleNotificationClick = () => {
    toast({
      title: "Bildirimler",
      description: "Yeni bildirimleriniz bulunmaktadır.",
      duration: 3000,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <span className="text-primary-500 text-2xl font-bold">RestoSoft</span>
            <span className="ml-2 text-gray-600 dark:text-gray-300 hidden sm:inline-flex text-sm">
              | Restoran Yönetim Sistemi
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 dark:text-gray-300"
            onClick={handleThemeToggle}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 dark:text-gray-300 relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">3</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm">{user.fullName}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Ayarlar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>Çıkış</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
