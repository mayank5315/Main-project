import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  vendors: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    category: v.string(),
    taxId: v.optional(v.string()),
  }).index("by_name", ["name"]),

  customers: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    companyName: v.optional(v.string()),
  }).index("by_name", ["name"]),

  invoices: defineTable({
    invoiceNumber: v.string(),
    vendorId: v.id("vendors"),
    customerId: v.optional(v.id("customers")),
    issueDate: v.number(),
    dueDate: v.number(),
    totalAmount: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("overdue"), v.literal("cancelled")),
    currency: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_status", ["status"])
    .index("by_issue_date", ["issueDate"])
    .index("by_invoice_number", ["invoiceNumber"]),

  lineItems: defineTable({
    invoiceId: v.id("invoices"),
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    category: v.optional(v.string()),
  }).index("by_invoice", ["invoiceId"]),

  payments: defineTable({
    invoiceId: v.id("invoices"),
    amount: v.number(),
    paymentDate: v.number(),
    paymentMethod: v.string(),
    reference: v.optional(v.string()),
    status: v.union(v.literal("completed"), v.literal("pending"), v.literal("failed")),
  }).index("by_invoice", ["invoiceId"]),

  chatHistory: defineTable({
    userId: v.optional(v.id("users")),
    query: v.string(),
    response: v.string(),
    sqlGenerated: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
