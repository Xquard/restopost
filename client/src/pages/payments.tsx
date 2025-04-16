import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Search, Filter, FileText, CreditCard, Download, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface Payment {
  id: number;
  orderId: number;
  amount: string;
  method: string;
  date: string;
  tableName: string;
  status: string;
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);

  const { toast } = useToast();
  const tenantId = 1; // In a real app, this would come from auth context

  // Example query - would be connected to backend in a real app
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['/api/tenants', tenantId, 'payments'],
    queryFn: async () => {
      // This is demo data since we don't have an actual payments endpoint
      return [
        { id: 1, orderId: 101, amount: '345', method: 'cash', date: '2023-06-15T14:30:00', tableName: 'Masa 2', status: 'completed' },
        { id: 2, orderId: 102, amount: '220', method: 'credit_card', date: '2023-06-15T18:15:00', tableName: 'Masa 5', status: 'completed' },
        { id: 3, orderId: 103, amount: '175', method: 'cash', date: '2023-06-16T12:45:00', tableName: 'Masa 9', status: 'completed' },
        { id: 4, orderId: 104, amount: '560', method: 'credit_card', date: '2023-06-16T20:00:00', tableName: 'Masa 7', status: 'refunded' },
        { id: 5, orderId: 105, amount: '420', method: 'online', date: '2023-06-17T15:30:00', tableName: 'Masa 4', status: 'completed' },
        { id: 6, orderId: 106, amount: '185', method: 'cash', date: '2023-06-17T19:15:00', tableName: 'Masa 1', status: 'pending' },
      ];
    },
    enabled: true,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handlePrintReceipt = () => {
    toast({
      title: 'Fiş Yazdırılıyor',
      description: `${selectedPayment?.tableName} için fiş yazdırma işlemi başlatıldı.`,
      duration: 3000,
    });
  };

  const handleExportPayments = () => {
    toast({
      title: 'Dışa Aktarma',
      description: 'Ödeme kayıtları dışa aktarılıyor.',
      duration: 3000,
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Nakit';
      case 'credit_card': return 'Kredi Kartı';
      case 'online': return 'Online Ödeme';
      default: return method;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">Beklemede</Badge>;
      case 'refunded':
        return <Badge className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">İade Edildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredPayments = payments
    .filter(payment => {
      // Filter by status
      if (activeTab !== 'all' && payment.status !== activeTab) return false;
      
      // Filter by search query
      if (searchQuery && 
          !payment.tableName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !payment.orderId.toString().includes(searchQuery)) {
        return false;
      }
      
      // Filter by date range
      if (dateRange.from && new Date(payment.date) < dateRange.from) return false;
      if (dateRange.to && new Date(payment.date) > dateRange.to) return false;
      
      // Filter by payment method
      if (paymentMethod && payment.method !== paymentMethod) return false;
      
      return true;
    });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ödemeler</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ödeme işlemlerini görüntüleyin ve yönetin</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Masa adı veya sipariş no..."
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline" onClick={handleExportPayments}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Tüm Ödemeler</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
            <TabsTrigger value="pending">Beklemede</TabsTrigger>
            <TabsTrigger value="refunded">İade Edilen</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="space-y-2 mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.length > 0 ? (
              filteredPayments.map(payment => (
                <Card 
                  key={payment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePaymentClick(payment)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{payment.tableName}</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Sipariş #{payment.orderId} • {formatDate(payment.date)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Ödeme Yöntemi:</span> {getPaymentMethodText(payment.method)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-semibold text-lg">₺{payment.amount}</div>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" /> Detaylar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || dateRange.from || dateRange.to || paymentMethod 
                    ? 'Filtreleme kriterlerinize uygun ödeme bulunamadı.' 
                    : 'Henüz ödeme kaydı bulunmamaktadır.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filter Dialog */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ödemeleri Filtrele</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarih Aralığı</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          format(dateRange.from, "PPP", { locale: tr })
                        ) : (
                          "Başlangıç Tarihi"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? (
                          format(dateRange.to, "PPP", { locale: tr })
                        ) : (
                          "Bitiş Tarihi"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ödeme Yöntemi</label>
                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Yöntemler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>Tüm Yöntemler</SelectItem>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                    <SelectItem value="online">Online Ödeme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDateRange({ from: undefined, to: undefined });
                setPaymentMethod(undefined);
              }}>
                Filtreleri Temizle
              </Button>
              <Button onClick={() => setFilterOpen(false)}>
                Uygula
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Details Dialog */}
        {selectedPayment && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ödeme Detayları</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ödeme ID:</span>
                  <span className="font-medium">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sipariş No:</span>
                  <span className="font-medium">#{selectedPayment.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Masa:</span>
                  <span className="font-medium">{selectedPayment.tableName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tarih & Saat:</span>
                  <span className="font-medium">{formatDate(selectedPayment.date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ödeme Yöntemi:</span>
                  <span className="font-medium">{getPaymentMethodText(selectedPayment.method)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Durum:</span>
                  <span>{getPaymentStatusBadge(selectedPayment.status)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tutar:</span>
                  <span className="font-bold text-xl">₺{selectedPayment.amount}</span>
                </div>
              </div>
              <DialogFooter>
                {selectedPayment.status === 'completed' && (
                  <Button variant="outline" onClick={handlePrintReceipt} className="mr-2">
                    <FileText className="h-4 w-4 mr-2" />
                    Fiş Yazdır
                  </Button>
                )}
                {selectedPayment.status === 'completed' && (
                  <Button variant="outline" className="mr-2" onClick={() => {
                    toast({
                      title: 'İade İşlemi',
                      description: 'İade işlemi başlatıldı.',
                      duration: 3000,
                    });
                  }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    İade Et
                  </Button>
                )}
                <Button onClick={() => setDetailsOpen(false)}>
                  Kapat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
