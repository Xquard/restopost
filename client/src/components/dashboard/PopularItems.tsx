import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface MenuItem {
  id: number;
  name: string;
  price: string;
  image?: string;
  quantity: number;
}

interface PopularItemsProps {
  tenantId: number;
}

export function PopularItems({ tenantId }: PopularItemsProps) {
  const { data: items = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/tenants', tenantId, 'popular-items'],
    enabled: Boolean(tenantId)
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>En Çok Satan Ürünler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>En Çok Satan Ürünler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center">
              <Avatar className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                <AvatarImage src={item.image} alt={item.name} />
                <AvatarFallback className="text-xs">{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">₺{item.price}</div>
              </div>
              <div className="text-sm font-semibold">{item.quantity} adet</div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Veri bulunamadı.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
