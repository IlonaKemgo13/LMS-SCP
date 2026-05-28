/**
 * Basic render tests for the Student Dashboard page.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock the useStudentDashboard hook
const mockUseStudentDashboard = jest.fn()
jest.mock('@/lib/hooks/useStudentDashboard', () => ({
  useStudentDashboard: () => mockUseStudentDashboard(),
}))

// Mock StudentLayout (heavy component with sidebar/topbar)
jest.mock('@/components/student/StudentLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="student-layout">{children}</div>
  ),
}))

// Mock Link from next/navigation
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import StudentDashboardPage from '@/app/student-dashboard/page'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('StudentDashboardPage — rendering', () => {
  it('renders without crashing when isLoading is true', () => {
    mockUseStudentDashboard.mockReturnValue({ data: undefined, isLoading: true })
    expect(() => renderWithProviders(<StudentDashboardPage />)).not.toThrow()
  })

  it('renders the StudentLayout wrapper', () => {
    mockUseStudentDashboard.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<StudentDashboardPage />)
    expect(screen.getByTestId('student-layout')).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    mockUseStudentDashboard.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<StudentDashboardPage />)
    // Loading placeholders should appear
    expect(screen.getAllByText('...').length).toBeGreaterThan(0)
  })

  it('renders dashboard cards for courses, average, deadlines, recordings', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: { id: 'u1', full_name: 'Test', email: 't@e.com', role: 'student', avatar_url: null },
        enrollments: [
          { course_id: 'c1', courses: { id: 'c1', title: 'Math', teacher_id: 't1', profiles: { full_name: 'Teacher' } } },
        ],
        announcements: [
          { id: 'a1', title: 'Exam Notice', content: 'Check schedule', deadline: null, created_at: '2026-01-01', course_id: null },
        ],
        recentGrades: [
          { id: 'g1', assessment_type: 'exam', score: 80, max_score: 100, created_at: '2026-01-01', course_id: 'c1' },
        ],
        recordingCount: 5,
      },
      isLoading: false,
    })

    renderWithProviders(<StudentDashboardPage />)

    // Stat cards
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Average')).toBeInTheDocument()
    expect(screen.getByText('Deadlines')).toBeInTheDocument()
    expect(screen.getByText('Recordings')).toBeInTheDocument()
  })

  it('shows enrollment count correctly', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [
          { course_id: 'c1', courses: { id: 'c1', title: 'Math', teacher_id: 't1', profiles: { full_name: 'T' } } },
          { course_id: 'c2', courses: { id: 'c2', title: 'Science', teacher_id: 't2', profiles: { full_name: 'T' } } },
        ],
        announcements: [],
        recentGrades: [],
        recordingCount: 0,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    // 2 courses enrolled — should show "2" in the Courses stat card
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows recording count correctly', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [],
        announcements: [],
        recentGrades: [],
        recordingCount: 7,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows "No announcements found." when announcements list is empty', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [],
        announcements: [],
        recentGrades: [],
        recordingCount: 0,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    expect(screen.getByText('No announcements found.')).toBeInTheDocument()
  })

  it('shows "No upcoming deadlines." when no deadlines', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [],
        announcements: [],
        recentGrades: [],
        recordingCount: 0,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    expect(screen.getByText('No upcoming deadlines.')).toBeInTheDocument()
  })

  it('renders announcement titles when data is present', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [],
        announcements: [
          { id: 'a1', title: 'Important Notice', content: 'Read this', deadline: null, created_at: '2026-01-01', course_id: null },
        ],
        recentGrades: [],
        recordingCount: 0,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    expect(screen.getByText('Important Notice')).toBeInTheDocument()
  })

  it('renders grade summary when grades are present', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [],
        announcements: [],
        recentGrades: [
          { id: 'g1', assessment_type: 'exam', score: 75, max_score: 100, created_at: '2026-01-01', course_id: 'c1' },
        ],
        recordingCount: 0,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    // 75% appears in both the "Average" stat card and the grade row — getAllByText handles multiple matches
    expect(screen.getAllByText('75%').length).toBeGreaterThan(0)
  })

  it('calculates average grade percentage correctly', () => {
    mockUseStudentDashboard.mockReturnValue({
      data: {
        profile: null,
        enrollments: [],
        announcements: [],
        recentGrades: [
          { id: 'g1', assessment_type: 'exam', score: 40, max_score: 100, created_at: '2026-01-01', course_id: 'c1' },
          { id: 'g2', assessment_type: 'quiz', score: 60, max_score: 100, created_at: '2026-01-01', course_id: 'c1' },
        ],
        recordingCount: 0,
      },
      isLoading: false,
    })
    renderWithProviders(<StudentDashboardPage />)
    // average = (40+60)/(100+100)*100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
})
