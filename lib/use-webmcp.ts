'use client';
import { useEffect, useRef } from 'react';
type ToolAction = (input: Record<string, unknown>) => unknown;
export function useWebMCP(
  name: string,
  description: string,
  inputSchema: object,
  action: ToolAction,
) {
  const latest = useRef(action);
  useEffect(() => {
    latest.current = action;
  }, [action]);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: object,
            options: { signal: AbortSignal },
          ) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name,
            description,
            inputSchema,
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input: unknown) {
              if (!input || typeof input !== 'object' || Array.isArray(input))
                throw new Error('Expected an object.');
              return latest.current(input as Record<string, unknown>);
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser capability. The visible controls remain available. */
    }
    return () => lifecycle.abort();
  }, [name, description, inputSchema]);
}
