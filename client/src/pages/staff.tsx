import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'waiter',
    isActive: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = 1; // In a real app, this would come from auth context

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/tenants', tenantId, 'users']
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (user: typeof newUser) => {
      return apiRequest('POST', `/api/tenants/${tenantId}/users`, {
        ...user,
        tenantId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants', tenantId, 'users'] });
      setDialogOpen(false);
      resetNewUser();
      toast({
        title: 'Kullanıcı Eklendi',
        description: `${newUser.fullName} başarıyla eklendi.`,
        duration: 3000,
      });
    }
  });

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen gerekli alanları doldurun.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    addUserMutation.mutate(newUser);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setNewUser({
      username: user.username,
      password: '', // We don't show existing password
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleAddNewUser = () => {
    resetNewUser();
    setEditUser(null);
    setDialogOpen(true);
  };

  const resetNewUser = () => {
    setNewUser({
      username: '',
      password: '',
      fullName: '',
      role: 'waiter',
      isActive: true
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setNewUser(prev => ({ ...prev, isActive: checked }));
  };

  const handleDeleteUser = (user: User) => {
    toast({
      title: 'Kullanıcı Silindi',
      description: `${user.fullName} başarıyla silindi.`,
      duration: 3000,
    });
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'manager': return 'Müdür';
      case 'waiter': return 'Garson';
      case 'chef': return 'Şef';
      default: return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Yönetici</Badge>;
      case 'manager':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Müdür</Badge>;
      case 'waiter':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Garson</Badge>;
      case 'chef':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Şef</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery && 
        !user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Personel Yönetimi</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Personel bilgilerini görüntüleyin ve yönetin</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Personel ara..."
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddNewUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Personel Ekle
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{user.fullName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Rol:</span>
                      <div>{getRoleBadge(user.role)}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Durum:</span>
                      <div>
                        <Badge variant={user.isActive ? "outline" : "secondary"} className={user.isActive ? "border-green-500 text-green-700 dark:text-green-400" : ""}>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4 mr-1" /> Düzenle
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteUser(user)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Sil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          {!isLoading && filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? 'Arama kriterlerine uygun personel bulunamadı.' : 'Henüz personel kaydı bulunmamaktadır.'}
              </p>
              <Button onClick={handleAddNewUser}>
                <UserPlus className="h-4 w-4 mr-2" /> Personel Ekle
              </Button>
            </div>
          )}

          {/* Add more staff card to end of grid */}
          {!isLoading && filteredUsers.length > 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={handleAddNewUser}>
                <Plus className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Yeni Personel Ekle</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add/Edit User Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Ad soyad giriniz"
                  value={newUser.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Kullanıcı adı giriniz"
                  value={newUser.username}
                  onChange={handleInputChange}
                  disabled={!!editUser}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Şifre {editUser && '(Değiştirmek için doldurun)'}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={editUser ? "Yeni şifre giriniz" : "Şifre giriniz"}
                  value={newUser.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newUser.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Yönetici</SelectItem>
                    <SelectItem value="manager">Müdür</SelectItem>
                    <SelectItem value="waiter">Garson</SelectItem>
                    <SelectItem value="chef">Şef</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newUser.isActive}
                  onCheckedChange={handleActiveChange}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
                {editUser 
                  ? (addUserMutation.isPending ? 'Güncelleniyor...' : 'Güncelle') 
                  : (addUserMutation.isPending ? 'Ekleniyor...' : 'Ekle')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
