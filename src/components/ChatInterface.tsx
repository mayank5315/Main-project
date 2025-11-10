import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  sql?: string;
  results?: any[];
  chartType?: "bar" | "table" | "metric";
  timestamp: number;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I can help you analyze your invoice data. Try asking questions like:\n\n• What's our total spend?\n• Show me the top vendors\n• Which invoices are pending?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const chatWithData = useAction(api.chat.chatWithData);
  const chatHistory = useQuery(api.chat.getChatHistory, { limit: 10 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithData({ query: input });
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Here's what I found:",
        sql: response.sql,
        results: response.results,
        chartType: response.chartType,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = (message: ChatMessage) => {
    if (!message.results) return null;

    if (message.chartType === "metric" && message.results[0]) {
      const value = Object.values(message.results[0])[0] as number;
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {typeof value === 'number' ? 
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) :
              value
            }
          </div>
        </div>
      );
    }

    if (message.chartType === "bar" && message.results.length > 0) {
      return (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={message.results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [
                typeof value === 'number' ? 
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) :
                  value,
                'Spend'
              ]} />
              <Bar dataKey="spend" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Default table view
    if (message.results.length > 0) {
      const keys = Object.keys(message.results[0]);
      return (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {keys.map((key) => (
                  <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {message.results.map((row, index) => (
                <tr key={index}>
                  {keys.map((key) => (
                    <td key={key} className="px-4 py-2 text-sm text-gray-900">
                      {typeof row[key] === 'number' && key.includes('Amount') || key.includes('spend') ? 
                        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row[key]) :
                        row[key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Chat History Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Chat History</h3>
        <div className="space-y-2">
          {chatHistory?.slice(0, 5).map((chat) => (
            <div key={chat._id} className="p-2 text-sm text-gray-600 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
              <div className="truncate">{chat.query}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(chat.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl rounded-lg p-4 ${
                message.type === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-900"
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {message.sql && (
                  <div className="mt-4 p-3 bg-gray-800 text-green-400 rounded text-sm font-mono overflow-x-auto">
                    {message.sql}
                  </div>
                )}
                
                {renderResults(message)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-gray-600">Analyzing your data...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500">
            Try asking: "What's our total spend?", "Show me top vendors", or "Which invoices are pending?"
          </div>
        </div>
      </div>
    </div>
  );
}
