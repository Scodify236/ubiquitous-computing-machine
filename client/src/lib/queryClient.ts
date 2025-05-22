import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Optimized query cache configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for periodic refresh
      gcTime: 15 * 60 * 1000, // 15 minutes to keep cached data longer (formerly cacheTime)
      retry: 1, // Retry once to handle temporary network issues
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff capped at 10 seconds
      networkMode: 'online', // Only fetch when network is available
      refetchOnMount: 'always', // Ensure fresh data when components mount
      // Note: keepPreviousData has been replaced in v5 with placeholderData
      // that uses the last successful data as placeholder
    },
    mutations: {
      retry: 1, // Add one retry for mutations to handle temporary network issues
      retryDelay: 1000, // Simple 1s delay for mutation retries
      networkMode: 'online', // Only mutate when network is available
    },
  },
});
