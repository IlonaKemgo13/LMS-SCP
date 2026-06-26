/**
 * Tests for the login page (src/app/page.tsx)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockSignInWithPassword = jest.fn()
const mockGetUser = jest.fn()
const mockProfileSingle = jest.fn()
const mockRouterPush = jest.fn()
const mockToastError = jest.fn()
const mockToastSuccess = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getUser: mockGetUser,
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockProfileSingle,
    }),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
  Toaster: () => null,
}))

import Home from '@/app/page'

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('LoginPage — rendering', () => {
  it('renders the login form', () => {
    render(<Home />)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the SCP Portal heading', () => {
    render(<Home />)
    expect(screen.getByText('SCP Portal')).toBeInTheDocument()
  })

  it('renders the "Welcome Back" card heading', () => {
    render(<Home />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('has email input of type email', () => {
    render(<Home />)
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('has password input of type password by default', () => {
    render(<Home />)
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('toggles password visibility when Show/Hide is clicked', async () => {
    render(<Home />)
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const toggleButton = screen.getByRole('button', { name: /show/i })

    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByRole('button', { name: /hide/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

describe('LoginPage — successful login', () => {
  it('redirects admin to /admin after login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({ data: { user: { id: 'uid' } } })
    mockProfileSingle.mockResolvedValue({ data: { role: 'admin' } })

    render(<Home />)
    // Use fireEvent.change instead of userEvent.type to avoid fake timer conflicts
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'admin@ex.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } })

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/admin')
    }, { timeout: 3000 })
  })

  it('redirects student to /student-dashboard after login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({ data: { user: { id: 'uid' } } })
    mockProfileSingle.mockResolvedValue({ data: { role: 'student' } })

    render(<Home />)
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'student@ex.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } })

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/student-dashboard')
    }, { timeout: 3000 })
  })

  it('redirects teacher to /teacher after login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({ data: { user: { id: 'uid' } } })
    mockProfileSingle.mockResolvedValue({ data: { role: 'teacher' } })

    render(<Home />)
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'teacher@ex.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass1234' } })

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/teacher')
    }, { timeout: 3000 })
  })
})

describe('LoginPage — failed login', () => {
  it('shows error toast on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })

    render(<Home />)
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'wrong@ex.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrongpass' } })

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    })

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('shows rate limit lockout after 3 failed attempts', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })

    render(<Home />)

    // Three consecutive failed attempts
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form') ||
          screen.getByRole('button', { name: /locked/i }).closest('form')!)
      })
    }

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/Too many failed attempts/i)
      )
    })
  })

  it('shows countdown after lockout', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })

    render(<Home />)

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        const form = document.querySelector('form')
        if (form) fireEvent.submit(form)
      })
      await act(async () => { await Promise.resolve() })
    }

    await waitFor(() => {
      // After lockout, button should show "Locked (Xs)"
      const buttons = screen.getAllByRole('button')
      const submitBtn = buttons.find(b => b.getAttribute('type') === 'submit')
      if (submitBtn) {
        expect(submitBtn.textContent).toMatch(/Locked|locked|\d+s/i)
      }
    })
  })
})

describe('LoginPage — forgot password modal', () => {
  it('opens forgot password modal when "Forgot password?" is clicked', async () => {
    render(<Home />)
    fireEvent.click(screen.getByText(/forgot password/i))
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
  })

  it('closes modal when Cancel is clicked', async () => {
    render(<Home />)
    fireEvent.click(screen.getByText(/forgot password/i))
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText('Reset Password')).not.toBeInTheDocument()
  })
})
