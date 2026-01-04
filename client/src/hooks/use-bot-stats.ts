import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useBotStats() {
  return useQuery({
    queryKey: [api.botStats.get.path],
    queryFn: async () => {
      const res = await fetch(api.botStats.get.path);
      if (!res.ok) throw new Error("Failed to fetch bot stats");
      return api.botStats.get.responses[200].parse(await res.json());
    },
    // Refresh stats every 30 seconds to show live activity feel
    refetchInterval: 30000, 
  });
}
