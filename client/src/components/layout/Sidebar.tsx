import { Link, useLocation } from 'wouter';
import { Home, Store, UtensilsCrossed, ClipboardList, Wallet, Package2, Users, BarChart2, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  restaurant: {
    name: string;
    logo?: string;
    membershipType: string;
  };
}

export function Sidebar({ isMobile, isOpen, onClose, restaurant }: SidebarProps) {
  const [location] = useLocation();

  const menuItems = [
    { icon: Home, label: 'Genel Bakış', path: '/dashboard' },
    { icon: Store, label: 'Salon Yönetimi', path: '/salon' },
    { icon: UtensilsCrossed, label: 'Menü Yönetimi', path: '/menu' },
    { icon: ClipboardList, label: 'Siparişler', path: '/orders' },
    { icon: Wallet, label: 'Ödemeler', path: '/payments' },
    { icon: Package2, label: 'Stok Yönetimi', path: '/inventory' },
    { icon: Users, label: 'Personel', path: '/staff' },
    { icon: BarChart2, label: 'Raporlar', path: '/reports' },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Ayarlar', path: '/settings' },
    { icon: HelpCircle, label: 'Yardım', path: '/help' },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  // Sidebar class to handle mobile open/close
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-md z-20 overflow-hidden pt-16 flex flex-col transition-transform duration-200 ease-in-out",
    isMobile ? (isOpen ? "transform-none" : "-translate-x-full") : "transform-none",
    "lg:translate-x-0"
  );

  // Don't render backdrop if not mobile or not open
  const renderBackdrop = isMobile && isOpen;

  return (
    <>
      {renderBackdrop && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-10 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses}>
        <ScrollArea className="flex-1">
          <div className="px-4 py-6 space-y-1">
            <div className="mb-8 px-2">
              <div className="flex items-center space-x-3 p-2 mb-2 rounded-lg">
                <span className="flex-shrink-0 inline-flex rounded-full bg-primary-500 p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                    <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </span>
                <div>
                  <p className="text-sm font-semibold dark:text-white">{restaurant.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{restaurant.membershipType}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={() => isMobile && onClose()}
                >
                  <div className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md",
                    isActive(item.path) 
                      ? "bg-primary-500 text-white" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <nav className="space-y-1">
            {bottomMenuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => isMobile && onClose()}
              >
                <div className={cn(
                  "flex items-center px-2 py-2 text-base font-medium rounded-md",
                  isActive(item.path) 
                    ? "bg-primary-500 text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}