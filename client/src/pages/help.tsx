import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  Video, 
  BookOpen, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const faqItems = [
  {
    question: "Sipariş nasıl oluşturabilirim?",
    answer: "Salon Yönetimi sayfasından bir masa seçin. Ardından 'Yeni Sipariş' butonuna tıklayın. Menüden ürün ekleyerek siparişi tamamlayabilirsiniz."
  },
  {
    question: "Masaları nasıl düzenleyebilirim?",
    answer: "Salon Yönetimi sayfasında 'Salon Düzenini Yönet' butonuna tıklayın. Açılan ekranda masaları sürükleyerek yerlerini değiştirebilir, yeni masa ekleyebilir veya mevcut masaları düzenleyebilirsiniz."
  },
  {
    question: "Menü öğelerini nasıl ekleyebilirim?",
    answer: "Menü Yönetimi sayfasında 'Ürün Ekle' butonuna tıklayın. Açılan formda ürün bilgilerini doldurun ve 'Ekle' butonuna tıklayın. Ürün resmi eklemek isteğe bağlıdır."
  },
  {
    question: "Stok uyarıları nasıl çalışır?",
    answer: "Stok Yönetimi sayfasında ürünler için minimum stok seviyesi belirleyebilirsiniz. Stok bu seviyenin altına düştüğünde sistem otomatik olarak uyarı verir."
  },
  {
    question: "QR kod menüyü nasıl oluşturabilirim?",
    answer: "Ayarlar > QR Kod Menü sayfasından 'QR Kodu Oluştur' butonuna tıklayın. Oluşturulan QR kodu indirebilir ve müşterileriniz için basabilirsiniz."
  },
  {
    question: "Raporları nasıl görebilirim?",
    answer: "Raporlar sayfasında farklı zaman aralıkları ve rapor türleri için verilerinizi görüntüleyebilirsiniz. Grafik veya tablo görünümünde inceleyebilir, dışa aktarabilirsiniz."
  },
  {
    question: "Personel eklemek için ne yapmalıyım?",
    answer: "Personel sayfasında 'Personel Ekle' butonuna tıklayın. Ad, soyad, kullanıcı adı, şifre ve rol bilgilerini doldurun. Kullanıcı adı benzersiz olmalıdır."
  },
  {
    question: "Yazıcı ayarlarını nasıl yapabilirim?",
    answer: "Ayarlar > Yazıcılar sayfasından yazıcı bilgilerini girebilir ve 'Test Yazdır' butonu ile bağlantıyı test edebilirsiniz."
  }
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Mesajınız Gönderildi",
      description: "En kısa sürede sizinle iletişime geçeceğiz.",
      variant: "default",
    });
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const filteredFaqs = faqItems.filter(item => 
    searchQuery === '' || 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Yardım ve Destek</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sık sorulan sorular ve destek seçenekleri</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Sorunuzu arayın..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="faq" className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Sık Sorulan Sorular
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Destek Talebi
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Dökümanlar
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Video Eğitimler
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <TabsContent value="faq" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sık Sorulan Sorular</CardTitle>
              <CardDescription>
                Yaygın sorular ve cevaplar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchQuery && filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Aramanızla eşleşen soru bulunamadı.</p>
                </div>
              )}
              
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Destek Talebi Oluştur</CardTitle>
              <CardDescription>
                Sorularınız için bizimle iletişime geçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Adınız Soyadınız</label>
                        <Input 
                          id="name" 
                          name="name"
                          value={contactForm.name}
                          onChange={handleContactChange}
                          placeholder="Adınız Soyadınız" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">E-posta Adresiniz</label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          value={contactForm.email}
                          onChange={handleContactChange}
                          placeholder="ornek@mail.com" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Konu</label>
                      <Input 
                        id="subject" 
                        name="subject"
                        value={contactForm.subject}
                        onChange={handleContactChange}
                        placeholder="Konu başlığı" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Mesajınız</label>
                      <Textarea 
                        id="message" 
                        name="message"
                        value={contactForm.message}
                        onChange={handleContactChange}
                        placeholder="Sorunuzu veya talebinizi detaylı bir şekilde açıklayın" 
                        rows={6} 
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full">Gönder</Button>
                  </form>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">İletişim Bilgileri</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-primary-500 mr-2" />
                        <span>+90 (212) 123 45 67</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-primary-500 mr-2" />
                        <span>destek@restosoft.com</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Destek Saatleri</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pazartesi - Cuma: 09:00 - 18:00<br />
                      Cumartesi: 10:00 - 14:00<br />
                      Pazar: Kapalı
                    </p>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Acil Destek</AlertTitle>
                    <AlertDescription>
                      Acil durumlarda 7/24 teknik destek hattımızı arayabilirsiniz.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Kullanım Kılavuzları</CardTitle>
              <CardDescription>
                Detaylı rehberler ve dökümanlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Başlangıç Kılavuzu</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Temel kurulum ve kullanım</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Görüntüle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Sipariş Yönetimi</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sipariş alma ve takibi</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Görüntüle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Menü Düzenleme</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Menü ve kategori yönetimi</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Görüntüle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Raporlama</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">İstatistik ve analiz raporları</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Görüntüle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Personel Yönetimi</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kullanıcı ve yetki yönetimi</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Görüntüle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <h3 className="font-medium">Gelişmiş Özellikler</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entegrasyonlar ve ek modüller</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Görüntüle</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Video Eğitimler</CardTitle>
              <CardDescription>
                Adım adım görsel eğitimler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-1">Sisteme Giriş ve Genel Bakış</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Bu videoda sistemin genel kullanımını ve temel özellikleri tanıtıyoruz.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">5:24 dakika</span>
                      <Button variant="outline" size="sm">İzle</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-1">Sipariş Nasıl Alınır?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Sipariş oluşturma, düzenleme ve iptal etme işlemlerini gösteriyoruz.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">7:12 dakika</span>
                      <Button variant="outline" size="sm">İzle</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-1">Salon Düzeninin Yapılandırılması</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Masaları düzenleme, bölüm oluşturma ve yerleşim planı yönetimi.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">6:30 dakika</span>
                      <Button variant="outline" size="sm">İzle</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-1">Raporlar ve Analitikler</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Satış raporları, ürün analizleri ve performans göstergeleri.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">8:17 dakika</span>
                      <Button variant="outline" size="sm">İzle</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 flex items-center justify-center">
                <Alert className="max-w-xl">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Canlı Eğitim!</AlertTitle>
                  <AlertDescription>
                    Ekibiniz için özel canlı eğitim düzenleyebiliriz. İletişime geçin: <span className="font-medium">egitim@restosoft.com</span>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
}
