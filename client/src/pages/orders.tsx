import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, Eye, ChevronRight, Search, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: number;
  tableId: number;
  status: string;
  startTime: string;
  endTime?: string;
  totalAmount: string;
  isPaid: boolean;
  paymentMethod?: string;
  table: {
    id: number;
    name: string;
  };
  items: OrderItem[];
  duration: number; // in minutes
}

interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  unitPrice: string;
  status: string;
  notes?: string;
  menuItem: {
    id: number;
    name: string;
    price: string;
  };
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: string;
  areaId: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: string;
  categoryId: number;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    tableId: '',
    customerCount: 1
  });
  const [newOrderItem, setNewOrderItem] = useState({
    menuItemId: '',
    quantity: 1,
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = 1; // In a real app, this would come from auth context
  const { updateOrderStatus, updateOrderItemStatus } = useWebSocket(tenantId);

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/tenants', tenantId, 'orders', { active: activeTab === 'active' }]
  });

  // Fetch tables for new order
  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['/api/tenants', tenantId, 'tables']
  });

  // Fetch menu items for adding to order
  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ['/api/tenants', tenantId, 'menu-items']
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: typeof newOrder) => {
      return apiRequest('POST', `/api/tenants/${tenantId}/orders`, {
        ...data,
        tableId: parseInt(data.tableId),
        userId: 1 // In a real app, this would be the current user ID
      });
    },
    onSuccess: async (response) => {
      const order = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'tables'] });
      setNewOrderDialogOpen(false);
      resetNewOrder();
      toast({
        title: 'Sipariş Oluşturuldu',
        description: `${tables.find(t => t.id === parseInt(newOrder.tableId))?.name} için yeni sipariş oluşturuldu.`,
        duration: 3000,
      });
      
      // Open the order details after creation
      setSelectedOrder(order);
      setOrderDetailsOpen(true);
    }
  });

  // Add item to order mutation
  const addOrderItemMutation = useMutation({
    mutationFn: async (data: { orderId: number, item: typeof newOrderItem }) => {
      const { orderId, item } = data;
      const menuItem = menuItems.find(m => m.id === parseInt(item.menuItemId));
      
      if (!menuItem) throw new Error("Menü öğesi bulunamadı");
      
      return apiRequest('POST', `/api/orders/${orderId}/items`, {
        ...item,
        menuItemId: parseInt(item.menuItemId),
        quantity: parseInt(item.quantity.toString()),
        unitPrice: menuItem.price
      });
    },
    onSuccess: () => {
      if (selectedOrder) {
        queryClient.invalidateQueries({ queryKey: ['/api/orders', selectedOrder.id, 'items'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'orders'] });
      }
      setAddItemDialogOpen(false);
      resetNewOrderItem();
      toast({
        title: 'Ürün Eklendi',
        description: "Siparişe yeni ürün eklendi.",
        duration: 3000,
      });
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      return apiRequest('PATCH', `/api/orders/${orderId}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'tables'] });
      toast({
        title: 'Sipariş Güncellendi',
        description: `Sipariş durumu güncellendi.`,
        duration: 3000,
      });
      
      // Also update via WebSocket
      updateOrderStatus(variables.orderId, variables.status);
    }
  });

  // Update order item status mutation
  const updateOrderItemStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: number, status: string }) => {
      return apiRequest('PATCH', `/api/order-items/${itemId}`, { status });
    },
    onSuccess: (_, variables) => {
      if (selectedOrder) {
        queryClient.invalidateQueries({ queryKey: ['/api/orders', selectedOrder.id, 'items'] });
      }
      toast({
        title: 'Ürün Güncellendi',
        description: `Ürün durumu güncellendi.`,
        duration: 3000,
      });
      
      // Also update via WebSocket
      updateOrderItemStatus(variables.itemId, variables.status);
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCreateOrder = () => {
    if (!newOrder.tableId) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen bir masa seçin.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    createOrderMutation.mutate(newOrder);
  };

  const handleAddOrderItem = () => {
    if (!selectedOrder || !newOrderItem.menuItemId) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen bir ürün seçin.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    addOrderItemMutation.mutate({
      orderId: selectedOrder.id,
      item: newOrderItem
    });
  };

  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleUpdateOrderItemStatus = (itemId: number, status: string) => {
    updateOrderItemStatusMutation.mutate({ itemId, status });
  };

  const resetNewOrder = () => {
    setNewOrder({
      tableId: '',
      customerCount: 1
    });
  };

  const resetNewOrderItem = () => {
    setNewOrderItem({
      menuItemId: '',
      quantity: 1,
      notes: ''
    });
  };

  const openNewOrderDialog = () => {
    resetNewOrder();
    if (tables.length > 0) {
      const emptyTables = tables.filter(t => t.status === 'empty');
      if (emptyTables.length > 0) {
        setNewOrder(prev => ({ ...prev, tableId: emptyTables[0].id.toString() }));
      } else {
        setNewOrder(prev => ({ ...prev, tableId: tables[0].id.toString() }));
      }
    }
    setNewOrderDialogOpen(true);
  };

  const openAddItemDialog = () => {
    resetNewOrderItem();
    if (menuItems.length > 0) {
      setNewOrderItem(prev => ({ ...prev, menuItemId: menuItems[0].id.toString() }));
    }
    setAddItemDialogOpen(true);
  };

  const getOrderStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">Aktif</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">İptal Edildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getOrderItemStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="outline">Yeni</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">Hazırlanıyor</Badge>;
      case 'served':
        return <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">Servis Edildi</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">İptal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery)
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Siparişler</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Siparişleri görüntüleyin ve yönetin</p>
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
            <Button onClick={openNewOrderDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Sipariş
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="active">Aktif Siparişler</TabsTrigger>
            <TabsTrigger value="all">Tüm Siparişler</TabsTrigger>
          </TabsList>
        </Tabs>

        {ordersLoading ? (
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOrderClick(order)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{order.table.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" /> 
                          {order.endTime ? 'Tamamlandı' : `${order.duration} dk`}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <span key={item.id}>
                            {item.quantity} × {item.menuItem.name}
                            {idx < Math.min(order.items.length, 2) - 1 && ', '}
                          </span>
                        ))}
                        {order.items.length > 2 && ` ve ${order.items.length - 2} ürün daha...`}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="font-medium">₺{order.totalAmount}</div>
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" /> Detaylar <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery ? 'Arama kriterlerine uygun sipariş bulunamadı.' : 'Henüz sipariş bulunmamaktadır.'}
                </p>
                <Button onClick={openNewOrderDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Sipariş
                </Button>
              </div>
            )}
          </div>
        )}

        {/* New Order Dialog */}
        <Dialog open={newOrderDialogOpen} onOpenChange={setNewOrderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sipariş Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="table-select">Masa</Label>
                <Select
                  value={newOrder.tableId}
                  onValueChange={(value) => setNewOrder(prev => ({ ...prev, tableId: value }))}
                >
                  <SelectTrigger id="table-select">
                    <SelectValue placeholder="Masa seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(table => (
                      <SelectItem 
                        key={table.id} 
                        value={table.id.toString()}
                        disabled={table.status !== 'empty'}
                      >
                        {table.name} ({table.status === 'empty' ? 'Boş' : 'Dolu'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-count">Müşteri Sayısı</Label>
                <Input
                  id="customer-count"
                  type="number"
                  min={1}
                  value={newOrder.customerCount}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customerCount: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewOrderDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateOrder} disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-start">
                  <span>{selectedOrder.table.name} Sipariş Detayı</span>
                  {getOrderStatusBadge(selectedOrder.status)}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex justify-between text-sm mb-4">
                  <div className="text-gray-500 dark:text-gray-400">Sipariş No:</div>
                  <div className="font-medium">{selectedOrder.id}</div>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <div className="text-gray-500 dark:text-gray-400">Başlangıç:</div>
                  <div className="font-medium">
                    {new Date(selectedOrder.startTime).toLocaleString('tr-TR')}
                  </div>
                </div>
                {selectedOrder.endTime && (
                  <div className="flex justify-between text-sm mb-4">
                    <div className="text-gray-500 dark:text-gray-400">Bitiş:</div>
                    <div className="font-medium">
                      {new Date(selectedOrder.endTime).toLocaleString('tr-TR')}
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-4">
                  <div className="text-gray-500 dark:text-gray-400">Ödeme Durumu:</div>
                  <div className="font-medium">
                    {selectedOrder.isPaid ? 
                      `Ödendi (${selectedOrder.paymentMethod || 'Nakit'})` : 
                      'Ödenmedi'
                    }
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Sipariş İçeriği</h3>
                    {selectedOrder.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={openAddItemDialog}>
                        <Plus className="h-3 w-3 mr-1" /> Ürün Ekle
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.quantity} × {item.menuItem.name}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className="font-medium mr-2">₺{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</div>
                          {getOrderItemStatusBadge(item.status)}
                          
                          {selectedOrder.status === 'active' && (
                            <Select
                              value={item.status}
                              onValueChange={(value) => handleUpdateOrderItemStatus(item.id, value)}
                            >
                              <SelectTrigger className="ml-2 h-7 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Yeni</SelectItem>
                                <SelectItem value="preparing">Hazırlanıyor</SelectItem>
                                <SelectItem value="served">Servis Edildi</SelectItem>
                                <SelectItem value="cancelled">İptal</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-medium text-lg">
                  <div>Toplam</div>
                  <div>₺{selectedOrder.totalAmount}</div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {selectedOrder.status === 'active' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="w-full sm:w-auto"
                    >
                      İptal Et
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // In a real app, this would open a payment dialog
                        toast({
                          title: "Ödeme Alındı",
                          description: "Ödeme işlemi tamamlandı.",
                          duration: 3000,
                        });
                      }}
                      className="w-full sm:w-auto"
                    >
                      Ödeme Al
                    </Button>
                    <Button 
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                      className="w-full sm:w-auto"
                    >
                      Tamamla
                    </Button>
                  </>
                )}
                {selectedOrder.status !== 'active' && (
                  <Button 
                    onClick={() => setOrderDetailsOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Kapat
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Item to Order Dialog */}
        {selectedOrder && (
          <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Siparişe Ürün Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-item">Ürün</Label>
                  <Select
                    value={newOrderItem.menuItemId}
                    onValueChange={(value) => setNewOrderItem(prev => ({ ...prev, menuItemId: value }))}
                  >
                    <SelectTrigger id="menu-item">
                      <SelectValue placeholder="Ürün seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} - ₺{item.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-quantity">Adet</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min={1}
                    value={newOrderItem.quantity}
                    onChange={(e) => setNewOrderItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-notes">Notlar (İsteğe Bağlı)</Label>
                  <Textarea
                    id="item-notes"
                    placeholder="Özel istekler, pişirme tercihi..."
                    value={newOrderItem.notes}
                    onChange={(e) => setNewOrderItem(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddOrderItem} disabled={addOrderItemMutation.isPending}>
                  {addOrderItemMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
