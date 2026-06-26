import { useQuery } from "@tanstack/react-query"

async function fetchStudentDashboard() {
  const res = await fetch("/api/student/dashboard")
  if (!res.ok) throw new Error("Failed to fetch dashboard")
  return res.json()
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student", "dashboard"],
    queryFn:  fetchStudentDashboard,
    staleTime: 5 * 60 * 1000,
  })
}
