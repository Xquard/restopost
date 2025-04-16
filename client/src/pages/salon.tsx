import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Store, TouchpadOff, Plus, Edit, Trash2, Move } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Area {
  id: number;
  name: string;
  isActive: boolean;
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  areaId: number;
  status: string;
  posX: number;
  posY: number;
  isActive: boolean;
}

export default function SalonPage() {
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    areaId: ''
  });
  const [newArea, setNewArea] = useState({
    name: '',
    isActive: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = 1; // In a real app, this would come from auth context

  // Fetch areas
  const { data: areas = [], isLoading: areasLoading } = useQuery<Area[]>({
    queryKey: ['/api/tenants', tenantId, 'areas']
  });

  // Fetch tables
  const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ['/api/tenants', tenantId, 'tables']
  });

  // Add table mutation
  const addTableMutation = useMutation({
    mutationFn: async (table: typeof newTable) => {
      return apiRequest('POST', `/api/tenants/${tenantId}/tables`, table);
    },
    onSuccess: async () => {
      // İlk olarak verileri geçersiz kıl (invalidate)
      await queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'tables'] });
      
      // Verilerin yeniden alınmasını zorlayalım
      queryClient.refetchQueries({ queryKey: ['/api/tenants', tenantId, 'tables'], type: 'active' });
      
      setTableDialogOpen(false);
      resetNewTable();
      toast({
        title: 'Masa Eklendi',
        description: 'Yeni masa başarıyla eklendi.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Masa eklenirken bir hata oluştu.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  });
  
  // Add area mutation
  const addAreaMutation = useMutation({
    mutationFn: async (area: typeof newArea) => {
      return apiRequest('POST', `/api/tenants/${tenantId}/areas`, area);
    },
    onSuccess: async () => {
      // İlk olarak verileri geçersiz kıl (invalidate)
      await queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'areas'] });
      
      // Verilerin yeniden alınmasını zorlayalım
      queryClient.refetchQueries({ queryKey: ['/api/tenants', tenantId, 'areas'], type: 'active' });
      
      setAreaDialogOpen(false);
      setNewArea({
        name: '',
        isActive: true
      });
      toast({
        title: 'Bölüm Eklendi',
        description: 'Yeni bölüm başarıyla eklendi.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Bölüm eklenirken bir hata oluştu.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  });

  const filteredTables = selectedArea
    ? tables.filter(table => table.areaId === selectedArea)
    : tables;

  const handleAreaChange = (areaId: number | null) => {
    setSelectedArea(areaId);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const openAddTableDialog = () => {
    if (areas.length > 0) {
      setNewTable(prev => ({ ...prev, areaId: areas[0].id.toString() }));
    }
    setTableDialogOpen(true);
  };

  const handleTableDialogClose = () => {
    setTableDialogOpen(false);
    resetNewTable();
  };
  
  const openAddAreaDialog = () => {
    setAreaDialogOpen(true);
  };
  
  const handleAreaDialogClose = () => {
    setAreaDialogOpen(false);
    setNewArea({
      name: '',
      isActive: true
    });
  };

  const resetNewTable = () => {
    setNewTable({
      name: '',
      capacity: 4,
      areaId: areas.length > 0 ? areas[0].id.toString() : ''
    });
  };

  const handleTableInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTable(prev => ({ ...prev, [name]: value }));
  };

  const handleTableSelectChange = (name: string, value: string) => {
    setNewTable(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewArea(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAreaSwitchChange = (checked: boolean) => {
    setNewArea(prev => ({ ...prev, isActive: checked }));
  };

  const handleAddTable = () => {
    if (!newTable.name || !newTable.areaId) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen gerekli alanları doldurun.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    // Form içinde tableData'yı ayrıca hazırlamıyoruz, sadece newTable'ı kullanıyoruz
    // Forma zaten string olarak geldiği için mutate ettiğimizde backend bu string değerleri uygun şekilde çevirecek
    addTableMutation.mutate(newTable);
  };

  const tableStatusClasses = (status: string) => {
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

  const tableStatusText = (status: string) => {
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Salon Yönetimi</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Masaları düzenleyin ve güncelleyin</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Button variant={isEditing ? "default" : "outline"} onClick={toggleEditMode}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Düzenlemeyi Bitir' : 'Düzenle'}
            </Button>
            <Button onClick={openAddTableDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Masa Ekle
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Salon Düzeni</span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={!selectedArea ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => handleAreaChange(null)}
                >
                  Tümü
                </Button>
                
                {areas.map(area => (
                  <Button
                    key={area.id}
                    variant={selectedArea === area.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAreaChange(area.id)}
                  >
                    {area.name === 'İç Mekan' ? (
                      <Store className="h-4 w-4 mr-1" />
                    ) : (
                      <TouchpadOff className="h-4 w-4 mr-1" />
                    )}
                    {area.name}
                  </Button>
                ))}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={openAddAreaDialog}
                  className="border border-dashed border-gray-300 dark:border-gray-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Bölüm Ekle
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTables.map(table => (
                  <div
                    key={table.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">{table.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Kapasite:</span>
                        <span className="text-sm">{table.capacity} Kişilik</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Bölüm:</span>
                        <span className="text-sm">{areas.find(a => a.id === table.areaId)?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Durum:</span>
                        <span className="text-sm">{tableStatusText(table.status)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Aktif:</span>
                        <Switch checked={table.isActive} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredTables.map(table => (
                  <div
                    key={table.id}
                    className={`${tableStatusClasses(table.status)} rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center cursor-pointer hover:shadow-md transition-shadow`}
                  >
                    <div className="font-semibold">{table.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{table.capacity} Kişilik</div>
                    <div className="text-xs mt-1">{tableStatusText(table.status)}</div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredTables.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Bu bölümde henüz masa bulunmamaktadır.</p>
                <Button variant="outline" className="mt-4" onClick={openAddTableDialog}>
                  <Plus className="h-4 w-4 mr-2" /> Masa Ekle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Table Dialog */}
        <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Masa Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Masa Adı</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Örn: Masa 1"
                  value={newTable.name}
                  onChange={handleTableInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasite</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="4"
                  value={newTable.capacity}
                  onChange={handleTableInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Bölüm</Label>
                <Select
                  value={newTable.areaId}
                  onValueChange={(value) => handleTableSelectChange('areaId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bölüm seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleTableDialogClose}>
                İptal
              </Button>
              <Button onClick={handleAddTable} disabled={addTableMutation.isPending}>
                {addTableMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Area Dialog */}
        <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Bölüm Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="areaName">Bölüm Adı</Label>
                <Input
                  id="areaName"
                  name="name"
                  placeholder="Örn: Teras"
                  value={newArea.name}
                  onChange={handleAreaInputChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="areaActive" className="flex-grow">Aktif</Label>
                <Switch 
                  id="areaActive" 
                  checked={newArea.isActive} 
                  onCheckedChange={handleAreaSwitchChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleAreaDialogClose}>
                İptal
              </Button>
              <Button 
                onClick={() => {
                  if (!newArea.name) {
                    toast({
                      title: 'Eksik Bilgi',
                      description: 'Lütfen bölüm adını girin.',
                      variant: 'destructive',
                      duration: 3000,
                    });
                    return;
                  }
                  addAreaMutation.mutate(newArea);
                }} 
                disabled={addAreaMutation.isPending}
              >
                {addAreaMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
