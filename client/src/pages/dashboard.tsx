import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableGrid } from '@/components/dashboard/TableGrid';
import { ActiveOrders } from '@/components/dashboard/ActiveOrders';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { PopularItems } from '@/components/dashboard/PopularItems';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Calendar, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  dailyRevenue: number;
  customerCount: number;
  averageCheck: number;
  occupancyRate: number;
  tables: any[];
  activeOrders: any[];
  popularItems: any[];
}

// Sales data for chart
const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const salesData = weekDays.map((day, index) => ({
  name: day,
  value: 3000 + Math.floor(Math.random() * 7000)
}));

export default function Dashboard() {
  // In a real app, you would get this from user auth context
  const tenantId = 1;
  
  const { isConnected, lastMessage } = useWebSocket(tenantId);
  const [dateFilter, setDateFilter] = useState('today');

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/tenants', tenantId, 'dashboard'],
    enabled: Boolean(tenantId)
  });

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
  };

  const handleExport = () => {
    alert('Dışa aktarma işlemi başlatıldı');
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Genel Bakış</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">İstatistikler ve özet veriler</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="relative">
              <Select defaultValue={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-[180px] pl-10">
                  <Calendar className="h-4 w-4 absolute left-3 text-gray-400" />
                  <SelectValue placeholder="Dönem Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="yesterday">Dün</SelectItem>
                  <SelectItem value="last7">Son 7 Gün</SelectItem>
                  <SelectItem value="last30">Son 30 Gün</SelectItem>
                  <SelectItem value="thisMonth">Bu Ay</SelectItem>
                  <SelectItem value="custom">Özel Aralık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Günlük Ciro"
                value={`₺${dashboardData?.dailyRevenue.toLocaleString() || '0'}`}
                change={{ value: "+16%", isPositive: true }}
                changeLabel="dünden"
                icon="revenue"
              />
              <StatCard
                title="Toplam Müşteri"
                value={dashboardData?.customerCount.toString() || '0'}
                change={{ value: "+12%", isPositive: true }}
                changeLabel="dünden"
                icon="customers"
              />
              <StatCard
                title="Ortalama Adisyon"
                value={`₺${dashboardData?.averageCheck.toLocaleString() || '0'}`}
                change={{ value: "-3%", isPositive: false }}
                changeLabel="dünden"
                icon="average"
              />
              <StatCard
                title="Doluluk Oranı"
                value={`%${dashboardData?.occupancyRate.toString() || '0'}`}
                change={{ value: "+5%", isPositive: true }}
                changeLabel="dünden"
                icon="occupancy"
              />
            </>
          )}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Status */}
          <div className="lg:col-span-2">
            <TableGrid tenantId={tenantId} />
          </div>

          {/* Active Orders */}
          <div>
            <ActiveOrders tenantId={tenantId} />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <SalesChart data={salesData} />

          {/* Popular Items */}
          <PopularItems tenantId={tenantId} />
        </div>
      </div>
    </div>
  );
}
