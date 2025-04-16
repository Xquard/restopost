import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Sun, Moon } from 'lucide-react';
import { toggleDarkMode } from '@/lib/themeToggle';
import { useTheme } from '@/hooks/use-theme';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleToggleTheme = () => {
    toggleDarkMode();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 rounded-full"
        onClick={handleToggleTheme}
        aria-label="Tema Değiştir"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-primary-500 text-4xl font-bold mb-2">RestoSoft</h1>
          <p className="text-gray-600 dark:text-gray-400">Restoran Yönetim Sistemi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza giriş yaparak sistemi kullanmaya başlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-gray-500 dark:text-gray-400">
            Demo kullanıcı: admin / Şifre: admin123
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
