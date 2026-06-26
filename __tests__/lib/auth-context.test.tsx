import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/lib/auth-context'

// Mock createClient from supabase/client
const mockGetUser = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockSignOut = jest.fn()
const mockFromProfiles = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return mockFromProfiles()
      }
      return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null }) }
    },
  }),
}))

// window.location is non-configurable in jsdom — no need to redefine it.
// The auth-context signOut just calls window.location.href = "/" — we
// spy on it in the relevant test below.

function TestConsumer() {
  const { user, profile, isLoading } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? user.id : 'null'}</span>
      <span data-testid="profile">{profile ? profile.full_name : 'null'}</span>
      <span data-testid="loading">{String(isLoading)}</span>
    </div>
  )
}

function TestSignOut() {
  const { user, signOut } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? user.id : 'null'}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

function TestRefresh() {
  const { profile, refreshProfile } = useAuth()
  return (
    <div>
      <span data-testid="profile">{profile ? profile.full_name : 'null'}</span>
      <button onClick={refreshProfile}>Refresh</button>
    </div>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  // Default: no auth state change listener fires, unsubscribe available
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  })
})

describe('useAuth — unauthenticated state', () => {
  it('returns null user and null profile when no user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockFromProfiles.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    })

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
    })

    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('profile').textContent).toBe('null')
  })

  it('isLoading starts true and becomes false after initialization', async () => {
    let resolveGetUser: (v: unknown) => void
    const delayedGetUser = new Promise((resolve) => { resolveGetUser = resolve })
    mockGetUser.mockReturnValue(delayedGetUser)

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
    })

    // Resolve the delayed promise
    await act(async () => {
      resolveGetUser!({ data: { user: null }, error: null })
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })
})

describe('useAuth — authenticated state', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockProfile = {
    id: 'user-123',
    full_name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
  }

  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockFromProfiles.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile }),
    })
  })

  it('sets user and profile when authenticated', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user-123')
      expect(screen.getByTestId('profile').textContent).toBe('Test User')
    })
  })

  it('isLoading becomes false after user is fetched', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })
})

describe('useAuth — signOut', () => {
  it('clears user and profile on signOut', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockProfile = {
      id: 'user-123', full_name: 'Test User',
      email: 'test@example.com', role: 'student',
      avatar_url: null, created_at: '2026-01-01',
    }
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    mockFromProfiles.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile }),
    })
    mockSignOut.mockResolvedValue({ error: null })

    await act(async () => {
      render(
        <AuthProvider>
          <TestSignOut />
        </AuthProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user-123')
    })

    await act(async () => {
      screen.getByText('Sign Out').click()
    })

    // After signOut, window.location.href is set to "/" and user is cleared
    expect(mockSignOut).toHaveBeenCalled()
  })
})

describe('useAuth — refreshProfile', () => {
  it('re-fetches profile when refreshProfile is called', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const initialProfile = {
      id: 'user-123', full_name: 'Old Name',
      email: 'test@example.com', role: 'student',
      avatar_url: null, created_at: '2026-01-01',
    }
    const updatedProfile = { ...initialProfile, full_name: 'New Name' }

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const singleMock = jest.fn()
      .mockResolvedValueOnce({ data: initialProfile })
      .mockResolvedValueOnce({ data: updatedProfile })

    mockFromProfiles.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: singleMock,
    })

    await act(async () => {
      render(
        <AuthProvider>
          <TestRefresh />
        </AuthProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile').textContent).toBe('Old Name')
    })

    await act(async () => {
      screen.getByText('Refresh').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile').textContent).toBe('New Name')
    })
  })
})
