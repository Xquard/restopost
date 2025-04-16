import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Save, Edit, Upload, QrCode, Printer, Bell, Database, Monitor, Server, ShieldCheck, CreditCard, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const themeColors = [
  { name: 'Mor', color: '#4F46E5', value: 'indigo' },
  { name: 'Mavi', color: '#2563EB', value: 'blue' },
  { name: 'Kırmızı', color: '#DC2626', value: 'red' },
  { name: 'Yeşil', color: '#16A34A', value: 'green' },
  { name: 'Turuncu', color: '#EA580C', value: 'orange' },
  { name: 'Pembe', color: '#DB2777', value: 'pink' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedThemeColor, setSelectedThemeColor] = useState('indigo');
  const [restaurant, setRestaurant] = useState({
    name: 'İstanbul Cafe',
    address: 'Beyoğlu, İstanbul',
    phone: '+90 555 123 4567',
    email: 'info@istanbulcafe.com',
    taxNumber: '1234567890',
    website: 'www.istanbulcafe.com',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
  });
  const [printer, setPrinter] = useState({
    enabled: true,
    name: 'Epson TM-T20III',
    type: 'thermal',
    ipAddress: '192.168.1.100',
    port: '9100'
  });
  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    stockAlerts: true,
    paymentNotifications: true,
    systemUpdates: false
  });
  
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handlePrinterChange = (name: string, value: string | boolean) => {
    setPrinter(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveGeneral = () => {
    toast({
      title: 'Değişiklikler Kaydedildi',
      description: 'Restoran bilgileri başarıyla güncellendi.',
      duration: 3000,
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: 'Tema Ayarları Kaydedildi',
      description: 'Görünüm ayarları başarıyla güncellendi.',
      duration: 3000,
    });
  };

  const handleSavePrinters = () => {
    toast({
      title: 'Yazıcı Ayarları Kaydedildi',
      description: 'Yazıcı ayarları başarıyla güncellendi.',
      duration: 3000,
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Bildirim Ayarları Kaydedildi',
      description: 'Bildirim tercihleri başarıyla güncellendi.',
      duration: 3000,
    });
  };

  const handleGenerateQr = () => {
    setIsQrDialogOpen(true);
  };

  const handleDownloadQr = () => {
    toast({
      title: 'QR Kod İndirildi',
      description: 'QR kod başarıyla indirildi.',
      duration: 3000,
    });
    setIsQrDialogOpen(false);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ayarlar</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sistem ve uygulama ayarlarını yönetin</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Tabs orientation="vertical" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="flex flex-col h-auto items-stretch w-full bg-transparent p-0 space-y-1">
                <TabsTrigger 
                  value="general" 
                  className={`justify-start px-4 py-2 ${activeTab === 'general' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Server className="h-4 w-4 mr-2" />
                  Genel
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className={`justify-start px-4 py-2 ${activeTab === 'appearance' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Görünüm
                </TabsTrigger>
                <TabsTrigger 
                  value="printers" 
                  className={`justify-start px-4 py-2 ${activeTab === 'printers' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Yazıcılar
                </TabsTrigger>
                <TabsTrigger 
                  value="qr" 
                  className={`justify-start px-4 py-2 ${activeTab === 'qr' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Kod Menü
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className={`justify-start px-4 py-2 ${activeTab === 'notifications' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Bildirimler
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className={`justify-start px-4 py-2 ${activeTab === 'payments' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ödeme Yöntemleri
                </TabsTrigger>
                <TabsTrigger 
                  value="backup" 
                  className={`justify-start px-4 py-2 ${activeTab === 'backup' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Yedekleme
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className={`justify-start px-4 py-2 ${activeTab === 'security' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Güvenlik
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="md:w-3/4">
            <TabsContent value="general" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Ayarlar</CardTitle>
                  <CardDescription>
                    Temel restoran bilgilerinizi düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                        <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Logo Değiştir
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Restoran Adı</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={restaurant.name} 
                          onChange={handleRestaurantChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={restaurant.email} 
                          onChange={handleRestaurantChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={restaurant.phone} 
                          onChange={handleRestaurantChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Web Sitesi</Label>
                        <Input 
                          id="website" 
                          name="website" 
                          value={restaurant.website} 
                          onChange={handleRestaurantChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="taxNumber">Vergi Numarası</Label>
                        <Input 
                          id="taxNumber" 
                          name="taxNumber" 
                          value={restaurant.taxNumber} 
                          onChange={handleRestaurantChange} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Adres</Label>
                      <Textarea 
                        id="address" 
                        name="address" 
                        value={restaurant.address} 
                        onChange={handleRestaurantChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveGeneral}>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Görünüm Ayarları</CardTitle>
                  <CardDescription>
                    Tema renklerini ve görünüm tercihlerini özelleştirin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Tema Rengi</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {themeColors.map(theme => (
                        <div 
                          key={theme.value}
                          className={`flex flex-col items-center cursor-pointer`}
                          onClick={() => setSelectedThemeColor(theme.value)}
                        >
                          <div 
                            className={`h-10 w-10 rounded-full mb-1`}
                            style={{ backgroundColor: theme.color }}
                          >
                            {selectedThemeColor === theme.value && (
                              <div className="h-full w-full flex items-center justify-center">
                                <div className="h-3 w-3 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs ${selectedThemeColor === theme.value ? 'font-medium' : ''}`}>
                            {theme.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Karanlık Mod</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="dark-mode"
                        defaultChecked={false}
                      />
                      <Label htmlFor="dark-mode">Sistem ayarlarını kullan</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Diğer Ayarlar</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compactView">Kompakt Görünüm</Label>
                        <Switch 
                          id="compactView"
                          defaultChecked={false}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="animations">Animasyonlar</Label>
                        <Switch 
                          id="animations"
                          defaultChecked={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveAppearance}>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="printers" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Yazıcı Ayarları</CardTitle>
                  <CardDescription>
                    Fiş yazıcıları ve mutfak yazıcılarını yapılandırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="printer-enabled"
                        checked={printer.enabled}
                        onCheckedChange={(checked) => handlePrinterChange('enabled', checked)}
                      />
                      <Label htmlFor="printer-enabled">Yazıcı Etkin</Label>
                    </div>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Test Yazdır
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="printer-name">Yazıcı Adı</Label>
                      <Input 
                        id="printer-name" 
                        value={printer.name} 
                        onChange={(e) => handlePrinterChange('name', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="printer-type">Yazıcı Tipi</Label>
                      <Select
                        value={printer.type}
                        onValueChange={(value) => handlePrinterChange('type', value)}
                      >
                        <SelectTrigger id="printer-type">
                          <SelectValue placeholder="Yazıcı tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thermal">Termal</SelectItem>
                          <SelectItem value="dot-matrix">Nokta Vuruşlu</SelectItem>
                          <SelectItem value="laser">Lazer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="printer-ip">IP Adresi</Label>
                      <Input 
                        id="printer-ip" 
                        value={printer.ipAddress} 
                        onChange={(e) => handlePrinterChange('ipAddress', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="printer-port">Port</Label>
                      <Input 
                        id="printer-port" 
                        value={printer.port} 
                        onChange={(e) => handlePrinterChange('port', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Fiş Ayarları</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="print-logo">Logo Yazdır</Label>
                        <Switch 
                          id="print-logo"
                          defaultChecked={true}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="print-automatic">Ödeme Sonrası Otomatik Yazdır</Label>
                        <Switch 
                          id="print-automatic"
                          defaultChecked={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSavePrinters}>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="qr" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>QR Kod Menü</CardTitle>
                  <CardDescription>
                    Dijital menü için QR kod oluşturun ve düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                    <div className="border-4 border-white dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900 mb-4">
                      <QrCode className="h-32 w-32 text-gray-900 dark:text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      Müşterileriniz için dijital menü QR kodu oluşturun. Müşterileriniz bu kodu telefonlarıyla tarayarak menünüzü görüntüleyebilir ve sipariş verebilirler.
                    </p>
                    <div className="flex space-x-2">
                      <Button onClick={handleGenerateQr}>
                        QR Kodu Oluştur
                      </Button>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Menü Düzenle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">QR Kod Ayarları</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="qr-direct-order">Doğrudan Sipariş İzni</Label>
                        <Switch 
                          id="qr-direct-order"
                          defaultChecked={true}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="qr-show-prices">Fiyatları Göster</Label>
                        <Switch 
                          id="qr-show-prices"
                          defaultChecked={true}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="qr-show-images">Ürün Görselleri</Label>
                        <Switch 
                          id="qr-show-images"
                          defaultChecked={true}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Bildirim Ayarları</CardTitle>
                  <CardDescription>
                    Hangi durumlar için bildirim almak istediğinizi yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="order-notifications" className="font-medium">Sipariş Bildirimleri</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Yeni sipariş geldiğinde bildirim alın</p>
                      </div>
                      <Switch 
                        id="order-notifications"
                        checked={notifications.orderNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('orderNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="stock-alerts" className="font-medium">Stok Uyarıları</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ürünler azaldığında bildirim alın</p>
                      </div>
                      <Switch 
                        id="stock-alerts"
                        checked={notifications.stockAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('stockAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="payment-notifications" className="font-medium">Ödeme Bildirimleri</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ödemeler tamamlandığında bildirim alın</p>
                      </div>
                      <Switch 
                        id="payment-notifications"
                        checked={notifications.paymentNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('paymentNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="system-updates" className="font-medium">Sistem Güncellemeleri</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Yeni özellikler ve güncellemeler hakkında bilgi alın</p>
                      </div>
                      <Switch 
                        id="system-updates"
                        checked={notifications.systemUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme Yöntemleri</CardTitle>
                  <CardDescription>
                    Kabul edilen ödeme yöntemlerini yapılandırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="cash-payment" className="font-medium">Nakit Ödeme</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nakit ödemeleri kabul edin</p>
                      </div>
                      <Switch 
                        id="cash-payment"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="card-payment" className="font-medium">Kredi/Banka Kartı</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kart ile ödemeleri kabul edin</p>
                      </div>
                      <Switch 
                        id="card-payment"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="online-payment" className="font-medium">Online Ödeme</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">QR kod ile ödeme, mobil ödeme vb.</p>
                      </div>
                      <Switch 
                        id="online-payment"
                        defaultChecked={false}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Online ödeme entegrasyonu</h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>
                            Online ödeme sistemlerini kullanmak için bir ödeme sağlayıcısı ile anlaşma yapmanız gerekmektedir. Daha fazla bilgi için bizimle iletişime geçin.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="backup" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Yedekleme & Geri Yükleme</CardTitle>
                  <CardDescription>
                    Verilerinizi yedekleyin ve gerektiğinde geri yükleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-2">Manuel Yedekleme</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Tüm verilerinizin anlık bir yedeğini alın. Bu işlem, tüm menü öğelerinizi, siparişlerinizi ve ayarlarınızı içerir.
                      </p>
                      <Button>
                        <Database className="h-4 w-4 mr-2" />
                        Şimdi Yedekle
                      </Button>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-2">Otomatik Yedekleme</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Verilerinizin düzenli olarak otomatik yedeklenmesini sağlayın.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-backup">Otomatik Yedekleme</Label>
                          <Switch 
                            id="auto-backup"
                            defaultChecked={true}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backup-frequency">Yedekleme Sıklığı</Label>
                          <Select defaultValue="daily">
                            <SelectTrigger id="backup-frequency">
                              <SelectValue placeholder="Sıklık seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Günlük</SelectItem>
                              <SelectItem value="weekly">Haftalık</SelectItem>
                              <SelectItem value="monthly">Aylık</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-2">Geri Yükleme</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Daha önce oluşturduğunuz bir yedekten verilerinizi geri yükleyin.
                      </p>
                      <Button variant="outline">
                        Yedeği Geri Yükle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Güvenlik Ayarları</CardTitle>
                  <CardDescription>
                    Hesap güvenliği ve erişim denetimi ayarlarını yapılandırın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Şifre Politikası</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-expiry">Şifre Sona Erme</Label>
                        <Switch 
                          id="password-expiry"
                          defaultChecked={false}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="complex-passwords">Karmaşık Şifre Zorunluluğu</Label>
                        <Switch 
                          id="complex-passwords"
                          defaultChecked={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Oturum Güvenliği</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="session-timeout">Otomatik Oturum Kapatma</Label>
                        <Switch 
                          id="session-timeout"
                          defaultChecked={true}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="timeout-duration">Süre:</Label>
                        <Select defaultValue="30">
                          <SelectTrigger id="timeout-duration" className="w-32">
                            <SelectValue placeholder="Süre seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 dakika</SelectItem>
                            <SelectItem value="30">30 dakika</SelectItem>
                            <SelectItem value="60">1 saat</SelectItem>
                            <SelectItem value="120">2 saat</SelectItem>
                            <SelectItem value="0">Asla</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dijital Menü QR Kodu</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="border-4 border-white dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 mb-4">
              <QrCode className="h-48 w-48 text-gray-900 dark:text-white" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 mb-4">
              Bu QR kodu masa üstünde bulundurun veya menü kartına ekleyin.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQrDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleDownloadQr}>
              <Download className="h-4 w-4 mr-2" />
              İndir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
