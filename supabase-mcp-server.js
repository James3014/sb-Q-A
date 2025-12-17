#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// 從環境變數取得 Supabase 設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MCP 伺服器實作
class SupabaseMCPServer {
  constructor() {
    this.tools = [
      {
        name: "query_lessons",
        description: "Query lessons table from Supabase",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", default: 10 },
            select: { type: "string", default: "*" }
          }
        }
      },
      {
        name: "count_lessons",
        description: "Count total lessons in database",
        inputSchema: { type: "object", properties: {} }
      }
    ];
  }

  async handleRequest(request) {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: "supabase-mcp-server",
                version: "1.0.0"
              }
            }
          };

        case 'tools/list':
          return {
            jsonrpc: "2.0",
            id,
            result: { tools: this.tools }
          };

        case 'tools/call':
          const { name, arguments: args } = params;
          let result;

          if (name === 'query_lessons') {
            const { data, error } = await supabase
              .from('lessons')
              .select(args.select || '*')
              .limit(args.limit || 10);
            
            if (error) throw error;
            result = { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
          } else if (name === 'count_lessons') {
            const { count, error } = await supabase
              .from('lessons')
              .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            result = { content: [{ type: "text", text: `Total lessons: ${count}` }] };
          } else {
            throw new Error(`Unknown tool: ${name}`);
          }

          return {
            jsonrpc: "2.0",
            id,
            result
          };

        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }

  start() {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (chunk) => {
      const lines = chunk.trim().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = await this.handleRequest(request);
            console.log(JSON.stringify(response));
          } catch (error) {
            console.error('Parse error:', error.message);
          }
        }
      }
    });

    process.stdin.resume();
  }
}

// 啟動伺服器
const server = new SupabaseMCPServer();
server.start();
