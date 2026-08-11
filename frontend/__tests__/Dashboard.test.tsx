import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/app/(app)/dashboard/page'
import { AuthProvider } from '@/lib/auth-context'
import * as api from '@/lib/api'

// Mock the api
jest.mock('@/lib/api', () => ({
  fetchApi: jest.fn()
}))

// Mock the API response
const mockMasteryData = [
  {
    concept_tag: 'basic_syntax',
    mastery_probability: 0.9,
    is_unlocked: true,
    prerequisites: [],
    problems_attempted: 5,
    problems_solved: 5
  },
  {
    concept_tag: 'loops',
    mastery_probability: 0.2,
    is_unlocked: true,
    prerequisites: ['basic_syntax'],
    problems_attempted: 1,
    problems_solved: 0
  },
  {
    concept_tag: 'dynamic_programming',
    mastery_probability: 0.0,
    is_unlocked: false,
    prerequisites: ['recursion'],
    problems_attempted: 0,
    problems_solved: 0
  }
]

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders mastery cards and correctly displays locked/unlocked state', async () => {
    (api.fetchApi as jest.Mock).mockImplementation(async (endpoint) => {
      if (endpoint === '/api/stats') {
        return {
          data: {
            total_problems_solved: 0,
            total_sessions: 0,
            current_streak: 0,
            strongest_concept: null,
            weakest_concept: null,
            avg_mastery: 0
          }
        }
      }
      if (endpoint === '/api/mastery') {
        return { data: mockMasteryData }
      }
      if (endpoint === '/api/auth/me') {
        return { user: { display_name: 'Test' } }
      }
      return {}
    })

    // Render with AuthProvider to avoid useAuth errors
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    )

    // Wait for data to load by waiting for a concept to appear
    await waitFor(() => {
      expect(screen.getByText('basic syntax')).toBeInTheDocument()
    })

    // Check rendered concepts
    expect(screen.getByText('loops')).toBeInTheDocument()
    expect(screen.getByText('dynamic programming')).toBeInTheDocument()

    // basic_syntax should be mastered (green)
    const syntaxCard = screen.getByText('basic syntax').parentElement?.parentElement
    expect(syntaxCard).toHaveTextContent('5 attempted')
    expect(syntaxCard).toHaveTextContent('5 solved')

    // DP should be locked (no percentage text)
    const dpCard = screen.getByText('dynamic programming').parentElement?.parentElement
    expect(dpCard).not.toHaveTextContent('%')
  })
})
