import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function StatsCards() {
  const stats = useQuery(api.analytics.getOverviewStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Spend",
      value: formatCurrency(stats.totalSpend),
      icon: "💰",
      color: "text-green-600",
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices.toString(),
      icon: "📄",
      color: "text-blue-600",
    },
    {
      title: "Documents Uploaded",
      value: stats.documentsUploaded.toString(),
      icon: "📁",
      color: "text-purple-600",
    },
    {
      title: "Avg Invoice Value",
      value: formatCurrency(stats.avgInvoiceValue),
      icon: "📊",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
