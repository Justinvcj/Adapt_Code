import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import userEvent from '@testing-library/user-event'

// Helper component to consume context
function TestComponent() {
  const { user, login, logout, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  return (
    <div>
      <div data-testid="user-status">{user ? user.display_name : 'Logged out'}</div>
      <button onClick={() => login('fake-token', { user_id: '123', display_name: 'Test User', email: 't@t.com', role: 'student', created_at: '' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch = jest.fn()
  })

  it('initially shows logged out state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged out')
    })
  })

  it('handles login flow correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged out')
    })

    const loginBtn = screen.getByText('Login')
    await userEvent.click(loginBtn)

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Test User')
      expect(localStorage.getItem('access_token')).toBe('fake-token')
    })
  })

  it('handles logout correctly', async () => {
    localStorage.setItem('access_token', 'fake-token')
    
    // Mock the /api/auth/me fetch on mount
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          user_id: '123',
          display_name: 'Test User'
        }
      })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Test User')
    })

    // Mock logout API call
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    const logoutBtn = screen.getByText('Logout')
    await userEvent.click(logoutBtn)

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })
})
