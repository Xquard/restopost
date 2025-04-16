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

// Generic fetch function for use with TanStack Query
export async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
  });
  
  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle array query keys properly
    let url = '';
    if (Array.isArray(queryKey)) {
      // Convert query key array to a URL
      url = typeof queryKey[0] === 'string' ? queryKey[0] : '';
      
      // If there are additional path segments, append them
      if (queryKey.length > 1) {
        for (let i = 1; i < queryKey.length; i++) {
          if (typeof queryKey[i] === 'string' || typeof queryKey[i] === 'number') {
            url += `/${queryKey[i]}`;
          }
        }
      }
    } else {
      url = String(queryKey);
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 0, // Verilerin hemen bayat olarak işaretlenmesi için
      retry: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});
