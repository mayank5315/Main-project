import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function InvoiceTrendsChart() {
  const trends = useQuery(api.analytics.getInvoiceTrends);

  if (!trends) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Invoice Volume & Value Trends</h3>
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
      <h3 className="text-lg font-semibold mb-4">Invoice Volume & Value Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => [
              name === 'value' ? formatCurrency(value as number) : value,
              name === 'value' ? 'Invoice Value' : 'Invoice Count'
            ]}
          />
          <Legend />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="count" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Invoice Count"
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Invoice Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
