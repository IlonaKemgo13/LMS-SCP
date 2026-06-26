import { useQuery } from "@tanstack/react-query"

async function fetchPaginated(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch data")
  return res.json()
}

export function useStudentCourses(page = 1) {
  return useQuery({
    queryKey: ["student", "courses", page],
    queryFn:  () => fetchPaginated(`/api/student/courses?page=${page}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentGrades(page = 1, courseId?: string) {
  const params = new URLSearchParams({ page: String(page) })
  if (courseId) params.set("course_id", courseId)
  return useQuery({
    queryKey: ["student", "grades", page, courseId],
    queryFn:  () => fetchPaginated(`/api/student/grades?${params}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentAnnouncements(page = 1) {
  return useQuery({
    queryKey: ["student", "announcements", page],
    queryFn:  () => fetchPaginated(`/api/student/announcements?page=${page}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentMaterials(page = 1, courseId?: string) {
  const params = new URLSearchParams({ page: String(page) })
  if (courseId) params.set("course_id", courseId)
  return useQuery({
    queryKey: ["student", "materials", page, courseId],
    queryFn:  () => fetchPaginated(`/api/student/materials?${params}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentRecordings(page = 1, courseId?: string) {
  const params = new URLSearchParams({ page: String(page) })
  if (courseId) params.set("course_id", courseId)
  return useQuery({
    queryKey: ["student", "recordings", page, courseId],
    queryFn:  () => fetchPaginated(`/api/student/recordings?${params}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentResults(page = 1) {
  return useQuery({
    queryKey: ["student", "results", page],
    queryFn:  () => fetchPaginated(`/api/student/results?page=${page}`),
    staleTime: 5 * 60 * 1000,
  })
}
