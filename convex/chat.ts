import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const chatWithData = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Simulate AI response for now - in production this would call Groq API
    const mockResponses = {
      "total spend": {
        sql: "SELECT SUM(totalAmount) as total_spend FROM invoices;",
        results: [{ total_spend: 49000 }] as any[],
        chartType: "metric" as const
      },
      "top vendors": {
        sql: "SELECT v.name, SUM(i.totalAmount) as spend FROM invoices i JOIN vendors v ON i.vendorId = v._id GROUP BY v.name ORDER BY spend DESC LIMIT 5;",
        results: [
          { name: "TechCorp Solutions", spend: 15000 },
          { name: "Legal Services LLC", spend: 12000 },
          { name: "Marketing Agency Pro", spend: 8500 },
          { name: "Consulting Group", spend: 7800 },
          { name: "Cloud Hosting Co", spend: 3200 }
        ] as any[],
        chartType: "bar" as const
      },
      "pending invoices": {
        sql: "SELECT invoiceNumber, totalAmount, dueDate FROM invoices WHERE status = 'pending';",
        results: [
          { invoiceNumber: "INV-2024-001", totalAmount: 15000, dueDate: "2024-02-15" },
          { invoiceNumber: "INV-2024-003", totalAmount: 8500, dueDate: "2024-02-10" },
          { invoiceNumber: "INV-2024-005", totalAmount: 3200, dueDate: "2024-02-20" },
          { invoiceNumber: "INV-2024-006", totalAmount: 7800, dueDate: "2024-02-25" }
        ] as any[],
        chartType: "table" as const
      }
    };

    // Simple keyword matching for demo
    const queryLower = args.query.toLowerCase();
    let response: { sql: string; results: any[]; chartType: "metric" | "bar" | "table" } = {
      sql: "-- AI-generated SQL query would appear here",
      results: [{ message: "No matching data found" }],
      chartType: "table" as const
    };

    if (queryLower.includes("total") && queryLower.includes("spend")) {
      response = mockResponses["total spend"];
    } else if (queryLower.includes("top") && queryLower.includes("vendor")) {
      response = mockResponses["top vendors"];
    } else if (queryLower.includes("pending")) {
      response = mockResponses["pending invoices"];
    }

    // Save to chat history
    await ctx.runMutation(internal.chat.saveChatHistory, {
      query: args.query,
      response: JSON.stringify(response),
      sqlGenerated: response.sql,
    });

    return response;
  },
});

export const saveChatHistory = internalMutation({
  args: {
    query: v.string(),
    response: v.string(),
    sqlGenerated: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    await ctx.db.insert("chatHistory", {
      userId: userId || undefined,
      query: args.query,
      response: args.response,
      sqlGenerated: args.sqlGenerated,
      timestamp: Date.now(),
    });
  },
});

export const getChatHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 20;
    
    return await ctx.db
      .query("chatHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});
