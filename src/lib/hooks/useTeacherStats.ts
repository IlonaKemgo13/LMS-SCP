import { useQuery } from "@tanstack/react-query"

async function fetchTeacherStats() {
  const res = await fetch("/api/teacher/stats")
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher", "stats"],
    queryFn:  fetchTeacherStats,
    staleTime: 5 * 60 * 1000,
  })
}
