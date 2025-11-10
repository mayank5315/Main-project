import { query } from "./_generated/server";
import { v } from "convex/values";

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();
    const vendors = await ctx.db.query("vendors").collect();
    
    const totalSpend = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalInvoices = invoices.length;
    const avgInvoiceValue = totalInvoices > 0 ? totalSpend / totalInvoices : 0;
    const documentsUploaded = totalInvoices; // Assuming each invoice is a document

    return {
      totalSpend,
      totalInvoices,
      documentsUploaded,
      avgInvoiceValue,
    };
  },
});

export const getInvoiceTrends = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").order("asc").collect();
    
    const monthlyData = invoices.reduce((acc, invoice) => {
      const date = new Date(invoice.issueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, count: 0, value: 0 };
      }
      
      acc[monthKey].count += 1;
      acc[monthKey].value += invoice.totalAmount;
      
      return acc;
    }, {} as Record<string, { month: string; count: number; value: number }>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  },
});

export const getTopVendors = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const invoices = await ctx.db.query("invoices").collect();
    
    const vendorSpend = invoices.reduce((acc, invoice) => {
      if (!acc[invoice.vendorId]) {
        acc[invoice.vendorId] = 0;
      }
      acc[invoice.vendorId] += invoice.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const vendorData = await Promise.all(
      Object.entries(vendorSpend).map(async ([vendorId, spend]) => {
        const vendor = await ctx.db.get(vendorId as any);
        return {
          vendorId,
          name: (vendor as any)?.name || "Unknown Vendor",
          spend,
        };
      })
    );

    return vendorData
      .sort((a, b) => b.spend - a.spend)
      .slice(0, limit);
  },
});

export const getCategorySpend = query({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").collect();
    const invoices = await ctx.db.query("invoices").collect();
    
    const categorySpend = invoices.reduce((acc, invoice) => {
      const vendor = vendors.find(v => v._id === invoice.vendorId);
      const category = vendor?.category || "Uncategorized";
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += invoice.totalAmount;
      
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categorySpend).map(([category, spend]) => ({
      category,
      spend,
    }));
  },
});

export const getCashOutflow = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    
    const outflowData = invoices.reduce((acc, invoice) => {
      const date = new Date(invoice.dueDate);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, amount: 0 };
      }
      
      acc[dateKey].amount += invoice.totalAmount;
      
      return acc;
    }, {} as Record<string, { date: string; amount: number }>);

    return Object.values(outflowData).sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getInvoicesList = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let invoicesQuery = ctx.db.query("invoices").order("desc");
    
    const invoices = await invoicesQuery.take(limit);
    
    const invoicesWithVendors = await Promise.all(
      invoices.map(async (invoice) => {
        const vendor = await ctx.db.get(invoice.vendorId);
        return {
          ...invoice,
          vendorName: vendor?.name || "Unknown Vendor",
        };
      })
    );

    // Filter by search term if provided
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      return invoicesWithVendors.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
          invoice.vendorName.toLowerCase().includes(searchTerm)
      );
    }

    return invoicesWithVendors;
  },
});
