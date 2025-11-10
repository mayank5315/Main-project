import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function VendorSpendChart() {
  const vendors = useQuery(api.analytics.getTopVendors, { limit: 10 });

  if (!vendors) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Top 10 Vendors by Spend</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Top 10 Vendors by Spend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={vendors} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={formatCurrency} />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Spend']} />
          <Bar dataKey="spend" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
