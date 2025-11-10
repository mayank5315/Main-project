import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StatsCards } from "./StatsCards";
import { InvoiceTrendsChart } from "./InvoiceTrendsChart";
import { VendorSpendChart } from "./VendorSpendChart";
import { CategorySpendChart } from "./CategorySpendChart";
import { CashOutflowChart } from "./CashOutflowChart";
import { InvoicesTable } from "./InvoicesTable";
import { useEffect } from "react";

export function Dashboard() {
  const stats = useQuery(api.analytics.getOverviewStats);
  const seedDatabase = useMutation(api.seedData.seedDatabase);

  // Auto-seed database if no data exists
  useEffect(() => {
    if (stats && stats.totalInvoices === 0) {
      seedDatabase();
    }
  }, [stats, seedDatabase]);

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceTrendsChart />
        <VendorSpendChart />
        <CategorySpendChart />
        <CashOutflowChart />
      </div>

      {/* Invoices Table */}
      <InvoicesTable />
    </div>
  );
}
