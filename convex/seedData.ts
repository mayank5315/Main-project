import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const existingVendors = await ctx.db.query("vendors").collect();
    const existingInvoices = await ctx.db.query("invoices").collect();
    const existingCustomers = await ctx.db.query("customers").collect();
    const existingLineItems = await ctx.db.query("lineItems").collect();
    const existingPayments = await ctx.db.query("payments").collect();

    for (const vendor of existingVendors) {
      await ctx.db.delete(vendor._id);
    }
    for (const invoice of existingInvoices) {
      await ctx.db.delete(invoice._id);
    }
    for (const customer of existingCustomers) {
      await ctx.db.delete(customer._id);
    }
    for (const lineItem of existingLineItems) {
      await ctx.db.delete(lineItem._id);
    }
    for (const payment of existingPayments) {
      await ctx.db.delete(payment._id);
    }

    // Sample vendors
    const vendors = [
      { name: "TechCorp Solutions", email: "billing@techcorp.com", category: "Technology", phone: "+1-555-0101" },
      { name: "Office Supplies Inc", email: "orders@officesupplies.com", category: "Office Supplies", phone: "+1-555-0102" },
      { name: "Marketing Agency Pro", email: "invoices@marketingpro.com", category: "Marketing", phone: "+1-555-0103" },
      { name: "Legal Services LLC", email: "billing@legalservices.com", category: "Legal", phone: "+1-555-0104" },
      { name: "Cloud Hosting Co", email: "billing@cloudhosting.com", category: "Technology", phone: "+1-555-0105" },
      { name: "Consulting Group", email: "finance@consultinggroup.com", category: "Consulting", phone: "+1-555-0106" },
      { name: "Software Licensing", email: "licenses@softwarelicensing.com", category: "Technology", phone: "+1-555-0107" },
      { name: "Facility Management", email: "billing@facilitymanagement.com", category: "Facilities", phone: "+1-555-0108" },
    ];

    const vendorIds = [];
    for (const vendor of vendors) {
      const vendorId = await ctx.db.insert("vendors", vendor);
      vendorIds.push(vendorId);
    }

    // Sample customers
    const customers = [
      { name: "Acme Corporation", email: "ap@acmecorp.com", companyName: "Acme Corp" },
      { name: "Global Industries", email: "finance@globalind.com", companyName: "Global Industries Ltd" },
    ];

    const customerIds = [];
    for (const customer of customers) {
      const customerId = await ctx.db.insert("customers", customer);
      customerIds.push(customerId);
    }

    // Sample invoices
    const invoices = [
      {
        invoiceNumber: "INV-2024-001",
        vendorId: vendorIds[0],
        customerId: customerIds[0],
        issueDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        dueDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
        totalAmount: 15000,
        status: "pending" as const,
        currency: "USD",
        description: "Software development services",
      },
      {
        invoiceNumber: "INV-2024-002",
        vendorId: vendorIds[1],
        customerId: customerIds[0],
        issueDate: Date.now() - 25 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        totalAmount: 2500,
        status: "paid" as const,
        currency: "USD",
        description: "Office supplies monthly order",
      },
      {
        invoiceNumber: "INV-2024-003",
        vendorId: vendorIds[2],
        customerId: customerIds[1],
        issueDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
        totalAmount: 8500,
        status: "pending" as const,
        currency: "USD",
        description: "Marketing campaign Q1",
      },
      {
        invoiceNumber: "INV-2024-004",
        vendorId: vendorIds[3],
        customerId: customerIds[0],
        issueDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        totalAmount: 12000,
        status: "overdue" as const,
        currency: "USD",
        description: "Legal consultation services",
      },
      {
        invoiceNumber: "INV-2024-005",
        vendorId: vendorIds[4],
        customerId: customerIds[1],
        issueDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
        totalAmount: 3200,
        status: "pending" as const,
        currency: "USD",
        description: "Cloud hosting services",
      },
      {
        invoiceNumber: "INV-2024-006",
        vendorId: vendorIds[5],
        customerId: customerIds[0],
        issueDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        dueDate: Date.now() + 25 * 24 * 60 * 60 * 1000,
        totalAmount: 7800,
        status: "pending" as const,
        currency: "USD",
        description: "Business consulting",
      },
    ];

    const invoiceIds = [];
    for (const invoice of invoices) {
      const invoiceId = await ctx.db.insert("invoices", invoice);
      invoiceIds.push(invoiceId);
    }

    // Sample line items
    const lineItems = [
      { invoiceId: invoiceIds[0], description: "Frontend Development", quantity: 100, unitPrice: 120, totalPrice: 12000, category: "Development" },
      { invoiceId: invoiceIds[0], description: "Backend Development", quantity: 25, unitPrice: 120, totalPrice: 3000, category: "Development" },
      { invoiceId: invoiceIds[1], description: "Paper Supplies", quantity: 50, unitPrice: 25, totalPrice: 1250, category: "Office" },
      { invoiceId: invoiceIds[1], description: "Printer Cartridges", quantity: 10, unitPrice: 125, totalPrice: 1250, category: "Office" },
      { invoiceId: invoiceIds[2], description: "Digital Marketing Campaign", quantity: 1, unitPrice: 8500, totalPrice: 8500, category: "Marketing" },
    ];

    for (const lineItem of lineItems) {
      await ctx.db.insert("lineItems", lineItem);
    }

    // Sample payments
    const payments = [
      {
        invoiceId: invoiceIds[1],
        amount: 2500,
        paymentDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        paymentMethod: "Bank Transfer",
        status: "completed" as const,
      },
    ];

    for (const payment of payments) {
      await ctx.db.insert("payments", payment);
    }

    return { message: "Database seeded successfully!" };
  },
});
