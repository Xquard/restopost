import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/use-theme';

// Sales data type
interface SalesData {
  name: string;
  value: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const { isDarkMode } = useTheme();
  
  // Calculate the maximum value for the Y-axis domain
  const maxValue = Math.max(...data.map(item => item.value));
  const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% margin
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-md shadow-md ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
          <p className="font-medium">{label}</p>
          <p className="text-primary-500">{`₺${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Günlük Satışlar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                domain={[0, yAxisMax]}
                tickFormatter={(value) => `₺${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Using the imported useTheme hook from @/hooks/use-theme.ts
