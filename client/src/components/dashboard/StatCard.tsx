import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown,
  ScanBarcode,
  Users,
  Receipt,
  BringToFront
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    isPositive: boolean;
  };
  changeLabel: string;
  icon: 'revenue' | 'customers' | 'average' | 'occupancy';
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, className }: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'revenue':
        return <ScanBarcode className="text-primary-500 dark:text-primary-300" />;
      case 'customers':
        return <Users className="text-blue-500 dark:text-blue-300" />;
      case 'average':
        return <Receipt className="text-green-500 dark:text-green-300" />;
      case 'occupancy':
        return <BringToFront className="text-purple-500 dark:text-purple-300" />;
      default:
        return <ScanBarcode className="text-primary-500 dark:text-primary-300" />;
    }
  };

  const getIconBackground = () => {
    switch (icon) {
      case 'revenue':
        return 'bg-primary-100 dark:bg-primary-700';
      case 'customers':
        return 'bg-blue-100 dark:bg-blue-800';
      case 'average':
        return 'bg-green-100 dark:bg-green-800';
      case 'occupancy':
        return 'bg-purple-100 dark:bg-purple-800';
      default:
        return 'bg-primary-100 dark:bg-primary-700';
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", getIconBackground())}>
            {getIcon()}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
                <div className="mt-1 flex items-baseline text-sm">
                  <span className={cn(
                    "font-semibold",
                    change.isPositive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {change.isPositive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                    {change.value}
                  </span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">{changeLabel}</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
