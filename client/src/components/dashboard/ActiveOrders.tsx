import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: number;
  name: string;
  price: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  status: string;
  menuItem: MenuItem;
}

interface Table {
  id: number;
  name: string;
}

interface Order {
  id: number;
  tableId: number;
  status: string;
  totalAmount: string;
  items: OrderItem[];
  table: Table;
  duration: number; // in minutes
}

interface ActiveOrdersProps {
  tenantId: number;
}

export function ActiveOrders({ tenantId }: ActiveOrdersProps) {
  const { toast } = useToast();
  
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/tenants', tenantId, 'orders', { active: true }],
    enabled: Boolean(tenantId)
  });

  const handleOrderClick = (order: Order) => {
    toast({
      title: `${order.table.name} Sipariş Detayları`,
      description: `Toplam Tutar: ₺${order.totalAmount}`,
      duration: 3000,
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'preparing':
        return (
          <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
            Hazırlanıyor
          </Badge>
        );
      case 'served':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
            Servis Edildi
          </Badge>
        );
      case 'bill_requested':
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
            Hesap İstedi
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktif Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktif Siparişler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition"
              onClick={() => handleOrderClick(order)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{order.table.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" /> {order.duration} dk
                  </div>
                </div>
                {getStatusBadge(order.items[0]?.status || 'new')}
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                {order.items.map((item, index) => (
                  <div key={item.id}>
                    {item.quantity} × {item.menuItem.name}
                    {index < order.items.length - 1 && <br />}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm font-medium">₺{order.totalAmount}</div>
                <Button variant="link" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm p-0">
                  Detaylar
                </Button>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aktif sipariş bulunmamaktadır.
            </div>
          )}
        </div>

        {orders.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="link" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm">
              Tüm Siparişleri Göster
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
