import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimumQuantity: number;
  purchasePrice: number;
  supplier: string;
  lastUpdated: string;
}

// Demo data for inventory
const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: 'Dana Kıyma',
    category: 'Et & Tavuk',
    unit: 'kg',
    quantity: 25,
    minimumQuantity: 10,
    purchasePrice: 180,
    supplier: 'Merkez Et',
    lastUpdated: '2023-06-15'
  },
  {
    id: 2,
    name: 'Tavuk Göğsü',
    category: 'Et & Tavuk',
    unit: 'kg',
    quantity: 18,
    minimumQuantity: 15,
    purchasePrice: 90,
    supplier: 'Merkez Et',
    lastUpdated: '2023-06-16'
  },
  {
    id: 3,
    name: 'Domates',
    category: 'Sebze',
    unit: 'kg',
    quantity: 8,
    minimumQuantity: 10,
    purchasePrice: 12,
    supplier: 'Meyve Sebze A.Ş.',
    lastUpdated: '2023-06-17'
  },
  {
    id: 4,
    name: 'Biber',
    category: 'Sebze',
    unit: 'kg',
    quantity: 12,
    minimumQuantity: 5,
    purchasePrice: 15,
    supplier: 'Meyve Sebze A.Ş.',
    lastUpdated: '2023-06-17'
  },
  {
    id: 5,
    name: 'Un',
    category: 'Kuru Gıda',
    unit: 'çuval',
    quantity: 7,
    minimumQuantity: 3,
    purchasePrice: 150,
    supplier: 'Toptan Gıda',
    lastUpdated: '2023-06-10'
  },
  {
    id: 6,
    name: 'Ayran',
    category: 'İçecek',
    unit: 'adet',
    quantity: 85,
    minimumQuantity: 50,
    purchasePrice: 4,
    supplier: 'İçecek Dağıtım',
    lastUpdated: '2023-06-14'
  },
  {
    id: 7,
    name: 'Kola',
    category: 'İçecek',
    unit: 'kasa',
    quantity: 12,
    minimumQuantity: 5,
    purchasePrice: 96,
    supplier: 'İçecek Dağıtım',
    lastUpdated: '2023-06-14'
  }
];

// Demo data for categories
const categories = [
  'Et & Tavuk',
  'Sebze',
  'Meyve',
  'Kuru Gıda',
  'İçecek',
  'Temizlik',
  'Diğer'
];

// Demo data for suppliers
const suppliers = [
  'Merkez Et',
  'Meyve Sebze A.Ş.',
  'Toptan Gıda',
  'İçecek Dağıtım',
  'Temizlik Market'
];

// Demo data for units
const units = ['kg', 'adet', 'litre', 'çuval', 'kasa', 'paket'];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: 0,
    minimumQuantity: 0,
    purchasePrice: 0,
    supplier: ''
  });
  
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAddNewItem = () => {
    resetNewItem();
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minimumQuantity: item.minimumQuantity,
      purchasePrice: item.purchasePrice,
      supplier: item.supplier
    });
    setDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen gerekli alanları doldurun.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (editItem) {
      toast({
        title: 'Stok Güncellendi',
        description: `${newItem.name} başarıyla güncellendi.`,
        duration: 3000,
      });
    } else {
      toast({
        title: 'Stok Eklendi',
        description: `${newItem.name} başarıyla eklendi.`,
        duration: 3000,
      });
    }

    setDialogOpen(false);
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      category: '',
      unit: '',
      quantity: 0,
      minimumQuantity: 0,
      purchasePrice: 0,
      supplier: ''
    });
  };

  const handleDeleteItem = (item: InventoryItem) => {
    toast({
      title: 'Stok Silindi',
      description: `${item.name} başarıyla silindi.`,
      duration: 3000,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minimumQuantity' || name === 'purchasePrice'
        ? parseFloat(value)
        : value
    }));
  };

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.quantity / item.minimumQuantity;
    
    if (item.quantity <= 0) {
      return { label: 'Tükendi', color: 'bg-red-500', textColor: 'text-red-800 dark:text-red-200', badge: <Badge variant="destructive">Tükendi</Badge> };
    } else if (ratio < 1) {
      return { label: 'Az', color: 'bg-yellow-500', textColor: 'text-yellow-800 dark:text-yellow-200', badge: <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">Az</Badge> };
    } else if (ratio < 2) {
      return { label: 'Normal', color: 'bg-blue-500', textColor: 'text-blue-800 dark:text-blue-200', badge: <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">Normal</Badge> };
    } else {
      return { label: 'Yeterli', color: 'bg-green-500', textColor: 'text-green-800 dark:text-green-200', badge: <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Yeterli</Badge> };
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    const percentage = (item.quantity / (item.minimumQuantity * 2)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const filteredItems = inventoryData.filter(item => {
    // Filter by tab
    if (activeTab !== 'all' && activeTab !== 'low' && item.category !== activeTab) {
      return false;
    }
    
    // Filter low stock items
    if (activeTab === 'low' && item.quantity > item.minimumQuantity) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && 
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.supplier.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const lowStockCount = inventoryData.filter(item => item.quantity <= item.minimumQuantity).length;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Stok Yönetimi</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Envanter takibi ve stok durumu</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Stok ara..."
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Stok Ekle
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 mr-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Düşük Stok</p>
                <p className="text-2xl font-semibold">{lowStockCount} Ürün</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">En Çok Kullanılan</p>
                <p className="text-lg font-semibold">Dana Kıyma, Tavuk Göğsü</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">En Az Kullanılan</p>
                <p className="text-lg font-semibold">Biber, Un</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="low" className="relative">
              Düşük Stok
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {lowStockCount}
                </span>
              )}
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Birim</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Stok Durumu</TableHead>
                <TableHead>Alış Fiyatı</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => {
                const stockStatus = getStockStatus(item);
                const stockPercentage = getStockPercentage(item);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{item.quantity}</span>
                        <Progress 
                          value={stockPercentage} 
                          className="h-2 mt-1"
                          indicatorClassName={stockStatus.color}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{stockStatus.badge}</TableCell>
                    <TableCell>₺{item.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteItem(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Arama kriterlerine uygun stok bulunamadı.' : 'Bu kategoride henüz stok bulunmamaktadır.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Add/Edit Item Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Stok Düzenle' : 'Yeni Stok Ekle'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ürün adı"
                    value={newItem.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Birim</Label>
                  <Select
                    value={newItem.unit}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Birim seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Tedarikçi</Label>
                  <Select
                    value={newItem.supplier}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, supplier: value }))}
                  >
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Tedarikçi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Miktar</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumQuantity">Minimum Miktar</Label>
                  <Input
                    id="minimumQuantity"
                    name="minimumQuantity"
                    type="number"
                    placeholder="0"
                    value={newItem.minimumQuantity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Alış Fiyatı (₺)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.purchasePrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSaveItem}>
                {editItem ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
