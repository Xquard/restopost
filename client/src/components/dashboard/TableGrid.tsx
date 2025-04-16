import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, TouchpadOff, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type TableStatus = 'empty' | 'occupied' | 'bill_requested';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: TableStatus;
  areaId: number;
}

interface Area {
  id: number;
  name: string;
}

interface TableGridProps {
  tenantId: number;
}

export function TableGrid({ tenantId }: TableGridProps) {
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const { updateTableStatus } = useWebSocket(tenantId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch areas
  const { data: areas = [] } = useQuery<Area[]>({
    queryKey: ['/api/tenants', tenantId, 'areas'],
    enabled: Boolean(tenantId)
  });

  // Fetch tables
  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ['/api/tenants', tenantId, 'tables'],
    enabled: Boolean(tenantId)
  });

  const handleAreaChange = (areaId: number | null) => {
    setSelectedArea(areaId);
  };

  const filteredTables = selectedArea
    ? tables.filter(table => table.areaId === selectedArea)
    : tables;

  const tableStatusClasses = (status: TableStatus) => {
    switch (status) {
      case 'empty':
        return 'bg-gray-100 dark:bg-gray-700';
      case 'occupied':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'bill_requested':
        return 'bg-yellow-100 dark:bg-yellow-900';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const tableStatusText = (status: TableStatus) => {
    switch (status) {
      case 'empty':
        return 'Boş';
      case 'occupied':
        return 'Dolu';
      case 'bill_requested':
        return 'Hesap İstedi';
      default:
        return 'Bilinmiyor';
    }
  };

  const handleTableClick = (table: Table) => {
    // In a real app, this would open a modal or navigate to table detail page
    toast({
      title: `${table.name}`,
      description: `Durum: ${tableStatusText(table.status)}, Kapasite: ${table.capacity} kişilik`,
      duration: 3000,
    });
    
    // Change table status - cycling through statuses for demo purposes
    let newStatus: TableStatus;
    switch (table.status) {
      case 'empty':
        newStatus = 'occupied';
        break;
      case 'occupied':
        newStatus = 'bill_requested';
        break;
      case 'bill_requested':
        newStatus = 'empty';
        break;
      default:
        newStatus = 'empty';
    }
    
    // Use WebSocket to update table status
    updateTableStatus(table.id, newStatus);
    
    // Optimistically update the UI
    queryClient.setQueryData(['/api/tenants', tenantId, 'tables'], (oldData: Table[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(t => t.id === table.id ? { ...t, status: newStatus } : t);
    });
  };

  const occupiedTables = tables.filter(table => table.status !== 'empty').length;
  const totalTables = tables.length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Salon Durumu</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant={!selectedArea ? "primary" : "outline"} 
              size="sm" 
              onClick={() => handleAreaChange(null)}
              className="px-3 py-1.5 text-sm"
            >
              <Users className="h-4 w-4 mr-1" /> Tümü
            </Button>
            
            {areas.map(area => (
              <Button
                key={area.id}
                variant={selectedArea === area.id ? "primary" : "outline"}
                size="sm"
                onClick={() => handleAreaChange(area.id)}
                className="px-3 py-1.5 text-sm"
              >
                {area.name === 'İç Mekan' ? (
                  <Store className="h-4 w-4 mr-1" />
                ) : (
                  <TouchpadOff className="h-4 w-4 mr-1" />
                )}
                {area.name}
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-600 mr-2"></span>
            <span className="text-gray-600 dark:text-gray-300">Boş</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-800 mr-2"></span>
            <span className="text-gray-600 dark:text-gray-300">Dolu</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full bg-yellow-200 dark:bg-yellow-800 mr-2"></span>
            <span className="text-gray-600 dark:text-gray-300">Hesap İstedi</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <div 
                key={index} 
                className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTables.map(table => (
              <div
                key={table.id}
                className={cn(
                  tableStatusClasses(table.status),
                  "rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center cursor-pointer hover:shadow-md transition-shadow"
                )}
                onClick={() => handleTableClick(table)}
              >
                <div className="font-semibold">{table.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{table.capacity} Kişilik</div>
                <div className="text-xs mt-1">{tableStatusText(table.status)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{totalTables}</span> masadan <span className="font-medium">{occupiedTables}</span> dolu
          </div>
          <Button variant="link" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm">
            Salon Düzenini Yönet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
