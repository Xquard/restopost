import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ImagePlus } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  image?: string;
  categoryId: number;
  isAvailable: boolean;
  preparationTime?: number;
}

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: ''
  });
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    isAvailable: true,
    preparationTime: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = 1; // In a real app, this would come from auth context

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/tenants', tenantId, 'categories']
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/tenants', tenantId, 'menu-items']
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (category: typeof newCategory) => {
      return apiRequest('POST', `/api/tenants/${tenantId}/categories`, category);
    },
    onSuccess: async () => {
      // İlk olarak verileri geçersiz kıl (invalidate)
      await queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'categories'] });
      
      // Verilerin yeniden alınmasını zorlayalım
      queryClient.refetchQueries({ queryKey: ['/api/tenants', tenantId, 'categories'], type: 'active' });
      
      // UI güncellemek için
      setDialogOpen(false);
      resetNewCategory();
      toast({
        title: 'Kategori Eklendi',
        description: 'Yeni kategori başarıyla eklendi.',
        duration: 3000,
      });
    }
  });

  // Add menu item mutation
  const addMenuItemMutation = useMutation({
    mutationFn: async (item: typeof newMenuItem) => {
      return apiRequest('POST', `/api/tenants/${tenantId}/menu-items`, {
        ...item,
        price: parseFloat(item.price),
        preparationTime: item.preparationTime ? parseInt(item.preparationTime) : undefined
      });
    },
    onSuccess: async () => {
      // İlk olarak verileri geçersiz kıl (invalidate)
      await queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'menu-items'] });
      
      // Verilerin yeniden alınmasını zorlayalım
      queryClient.refetchQueries({ queryKey: ['/api/tenants', tenantId, 'menu-items'], type: 'active' });
      
      // UI güncellemek için 
      setNewItemDialogOpen(false);
      resetNewMenuItem();
      toast({
        title: 'Ürün Eklendi',
        description: 'Yeni ürün başarıyla eklendi.',
        duration: 3000,
      });
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const openAddCategoryDialog = () => {
    setDialogOpen(true);
  };

  const openAddItemDialog = () => {
    if (categories.length > 0) {
      setNewMenuItem(prev => ({ ...prev, categoryId: categories[0].id.toString() }));
    }
    setNewItemDialogOpen(true);
  };

  const resetNewCategory = () => {
    setNewCategory({
      name: '',
      image: ''
    });
  };

  const resetNewMenuItem = () => {
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      image: '',
      categoryId: categories.length > 0 ? categories[0].id.toString() : '',
      isAvailable: true,
      preparationTime: ''
    });
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleMenuItemInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMenuItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen kategori adı girin.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    addCategoryMutation.mutate(newCategory);
  };

  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.categoryId) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen gerekli alanları doldurun.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    addMenuItemMutation.mutate(newMenuItem);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Bilinmiyor';
  };

  const filteredItems = activeTab === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === parseInt(activeTab));

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Menü Yönetimi</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kategorileri ve menü öğelerini yönetin</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Button variant="outline" onClick={openAddCategoryDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Kategori Ekle
            </Button>
            <Button onClick={openAddItemDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ürün Ekle
            </Button>
          </div>
        </div>

        {categoriesLoading ? (
          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-xl" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="all">Tümü</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {menuItemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <ImagePlus className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button variant="ghost" size="icon" className="bg-white/80 dark:bg-gray-800/80 h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-white/80 dark:bg-gray-800/80 h-8 w-8 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getCategoryName(item.categoryId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₺{item.price}</p>
                      {item.preparationTime && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.preparationTime} dk</p>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{item.description}</p>
                  )}
                  <div className="flex items-center">
                    <Label htmlFor={`available-${item.id}`} className="mr-2 text-sm">Stoğunda:</Label>
                    <Switch id={`available-${item.id}`} checked={item.isAvailable} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!menuItemsLoading && filteredItems.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activeTab === 'all' 
                ? 'Menüde henüz ürün bulunmamaktadır.' 
                : 'Bu kategoride henüz ürün bulunmamaktadır.'}
            </p>
            <Button onClick={openAddItemDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ürün Ekle
            </Button>
          </div>
        )}

        {/* Add Category Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Kategori Adı</Label>
                <Input
                  id="category-name"
                  name="name"
                  placeholder="Örn: Ana Yemekler"
                  value={newCategory.name}
                  onChange={handleCategoryInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-image">Görsel URL (İsteğe bağlı)</Label>
                <Input
                  id="category-image"
                  name="image"
                  placeholder="https://example.com/category.jpg"
                  value={newCategory.image}
                  onChange={handleCategoryInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddCategory} disabled={addCategoryMutation.isPending}>
                {addCategoryMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Menu Item Dialog */}
        <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Ürün Adı</Label>
                  <Input
                    id="item-name"
                    name="name"
                    placeholder="Örn: Adana Kebap"
                    value={newMenuItem.name}
                    onChange={handleMenuItemInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Fiyat (₺)</Label>
                  <Input
                    id="item-price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newMenuItem.price}
                    onChange={handleMenuItemInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-description">Açıklama</Label>
                <Textarea
                  id="item-description"
                  name="description"
                  placeholder="Ürün açıklaması..."
                  rows={3}
                  value={newMenuItem.description}
                  onChange={handleMenuItemInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-category">Kategori</Label>
                  <select
                    id="item-category"
                    name="categoryId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newMenuItem.categoryId}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-prep-time">Hazırlama Süresi (dk)</Label>
                  <Input
                    id="item-prep-time"
                    name="preparationTime"
                    type="number"
                    placeholder="15"
                    value={newMenuItem.preparationTime}
                    onChange={handleMenuItemInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-image">Görsel URL (İsteğe bağlı)</Label>
                <Input
                  id="item-image"
                  name="image"
                  placeholder="https://example.com/food.jpg"
                  value={newMenuItem.image}
                  onChange={handleMenuItemInputChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="item-available"
                  checked={newMenuItem.isAvailable}
                  onCheckedChange={(checked) => 
                    setNewMenuItem(prev => ({ ...prev, isAvailable: checked }))
                  }
                />
                <Label htmlFor="item-available">Stoğunda</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddMenuItem} disabled={addMenuItemMutation.isPending}>
                {addMenuItemMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
