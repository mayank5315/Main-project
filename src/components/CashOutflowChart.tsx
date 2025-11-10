import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function CashOutflowChart() {
  const outflow = useQuery(api.analytics.getCashOutflow);

  if (!outflow) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Expected Cash Outflow</h3>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Expected Cash Outflow</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={outflow}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip 
            formatter={(value) => [formatCurrency(value as number), 'Amount']}
            labelFormatter={(label) => `Due Date: ${formatDate(label)}`}
          />
          <Bar dataKey="amount" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
