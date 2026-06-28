import { useQuery } from "@tanstack/react-query"

async function fetchAdminStats() {
  const res = await fetch("/api/admin/stats")
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn:  fetchAdminStats,
    staleTime: 5 * 60 * 1000,
  })
}
