import { useQuery } from "@tanstack/react-query"

async function fetchPaginated(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch data")
  return res.json()
}

export function useParentDashboard() {
  return useQuery({
    queryKey: ["parent", "dashboard"],
    queryFn:  () => fetchPaginated("/api/parent/dashboard"),
    staleTime: 5 * 60 * 1000,
  })
}

export function useParentChildren() {
  return useQuery({
    queryKey: ["parent", "children"],
    queryFn:  () => fetchPaginated("/api/parent/children"),
    staleTime: 5 * 60 * 1000,
  })
}

export function useParentGrades(page = 1, studentId?: string) {
  const params = new URLSearchParams({ page: String(page) })
  if (studentId) params.set("student_id", studentId)
  return useQuery({
    queryKey: ["parent", "grades", page, studentId],
    queryFn:  () => fetchPaginated(`/api/parent/grades?${params}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useParentAnnouncements(page = 1) {
  return useQuery({
    queryKey: ["parent", "announcements", page],
    queryFn:  () => fetchPaginated(`/api/parent/announcements?page=${page}`),
    staleTime: 5 * 60 * 1000,
  })
}
