import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, BarChart3, PieChart, LineChart, Table2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';

// Sales data for different reports
const dailySalesData = Array.from({ length: 7 }, (_, i) => {
  const date = subDays(new Date(), 6 - i);
  return {
    name: format(date, 'EEE', { locale: tr }),
    value: 2000 + Math.floor(Math.random() * 8000)
  };
});

const monthlySalesData = Array.from({ length: 12 }, (_, i) => {
  const date = subMonths(new Date(), 11 - i);
  return {
    name: format(date, 'MMM', { locale: tr }),
    value: 50000 + Math.floor(Math.random() * 100000)
  };
});

const categoryData = [
  { name: 'Ana Yemekler', value: 35 },
  { name: 'İçecekler', value: 25 },
  { name: 'Tatlılar', value: 15 },
  { name: 'Kebaplar', value: 20 },
  { name: 'Salatalar', value: 5 }
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  name: `${i}:00`,
  value: i >= 6 && i <= 23 ? 10 + Math.floor(Math.random() * (i >= 18 && i <= 21 ? 50 : 30)) : 0
}));

const tableData = [
  { id: 1, name: 'Adana Kebap', quantity: 246, amount: 29520 },
  { id: 2, name: 'Ayran', quantity: 302, amount: 4530 },
  { id: 3, name: 'Fıstıklı Baklava', quantity: 189, amount: 16065 },
  { id: 4, name: 'Kaşarlı Pide', quantity: 173, amount: 9515 },
  { id: 5, name: 'Karışık Pizza', quantity: 149, amount: 13410 },
  { id: 6, name: 'İskender', quantity: 136, amount: 19040 },
  { id: 7, name: 'Künefe', quantity: 125, amount: 9375 },
  { id: 8, name: 'Kola', quantity: 243, amount: 4860 },
  { id: 9, name: 'Lahmacun', quantity: 201, amount: 6030 },
  { id: 10, name: 'Tavuk Şiş', quantity: 187, amount: 16830 }
];

// Colors for pie chart
const COLORS = ['#4F46E5', '#60a5fa', '#8B5CF6', '#EF4444', '#10B981'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [reportType, setReportType] = useState('daily');
  const [viewType, setViewType] = useState('chart');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleReportTypeChange = (value: string) => {
    setReportType(value);
  };

  const handleViewTypeChange = (value: string) => {
    setViewType(value);
  };

  const handleExport = () => {
    toast({
      title: 'Dışa Aktarma',
      description: 'Rapor dışa aktarılıyor...',
      duration: 3000,
    });
  };

  // Function to get current report data based on active tab and report type
  const getCurrentReportData = () => {
    if (activeTab === 'sales') {
      return reportType === 'daily' ? dailySalesData : monthlySalesData;
    }
    if (activeTab === 'categories') {
      return categoryData;
    }
    if (activeTab === 'hourly') {
      return hourlyData;
    }
    return dailySalesData; // Default
  };

  // Function to render the appropriate chart based on activeTab and viewType
  const renderChart = () => {
    const data = getCurrentReportData();
    
    if (viewType === 'table') {
      return (
        <div className="mt-4 border rounded">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sıra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Miktar/Adet</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutar (₺)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {activeTab === 'products' ? (
                tableData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium text-right">₺{item.amount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                data.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium text-right">₺{item.value.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'categories') {
      return (
        <div className="h-[400px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Oran']} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (activeTab === 'hourly') {
      return (
        <div className="h-[400px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₺${value.toLocaleString()}`, 'Satış']} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" activeDot={{ r: 8 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    // Default: Bar chart for sales
    return (
      <div className="h-[400px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`₺${value.toLocaleString()}`, 'Satış']} />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" name="Satış" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Raporlar</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Satış, ürün ve performans raporları</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d MMMM", { locale: tr })} -{" "}
                        {format(dateRange.to, "d MMMM", { locale: tr })}
                      </>
                    ) : (
                      format(dateRange.from, "d MMMM", { locale: tr })
                    )
                  ) : (
                    "Tarih seçin"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  locale={tr}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-sm text-gray-500 dark:text-gray-400">Günlük Ortalama Ciro</p>
                <p className="text-2xl font-bold mt-2">₺8,430</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+16% dünden</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aylık Toplam Ciro</p>
                <p className="text-2xl font-bold mt-2">₺253,240</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% geçen aydan</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Müşteri</p>
                <p className="text-2xl font-bold mt-2">1,267</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% geçen aydan</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ortalama Adisyon</p>
                <p className="text-2xl font-bold mt-2">₺243</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">-3% geçen aydan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="sales" className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Satışlar
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="flex items-center">
                    <PieChart className="h-4 w-4 mr-2" />
                    Kategoriler
                  </TabsTrigger>
                  <TabsTrigger value="hourly" className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2" />
                    Saatlik
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center">
                    <Table2 className="h-4 w-4 mr-2" />
                    Ürünler
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-wrap gap-3">
                {activeTab === 'sales' && (
                  <Select value={reportType} onValueChange={handleReportTypeChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Rapor Türü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={viewType} onValueChange={handleViewTypeChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Görünüm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chart">Grafik</SelectItem>
                    <SelectItem value="table">Tablo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-full">
              {activeTab === 'products' && viewType === 'chart' ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-gray-500">Ürün raporları yalnızca tablo görünümünde mevcuttur.</p>
                </div>
              ) : (
                renderChart()
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
