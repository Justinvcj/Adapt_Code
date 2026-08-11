import { render, screen, fireEvent } from '@testing-library/react'
import ProblemPanel from '@/components/ProblemPanel'

const mockProblem = {
  problem_id: '123',
  title: 'Two Sum',
  description: 'Find two numbers that add up to target',
  difficulty_level: 'easy',
  concept_tag: 'arrays',
  hint_text: 'Use a hash map'
}

describe('ProblemPanel', () => {
  it('renders problem details correctly', () => {
    render(
      <ProblemPanel 
        problem={mockProblem} 
        timeSeconds={0}
        attempts={0}
        hint={null}
        loadingHint={false}
        onShowHint={jest.fn()}
      />
    )
    
    expect(screen.getByText('Two Sum')).toBeInTheDocument()
    expect(screen.getByText('easy')).toBeInTheDocument()
    expect(screen.getByText('arrays')).toBeInTheDocument()
    // react-markdown will render the text inside a standard element
    expect(screen.getByText('Find two numbers that add up to target')).toBeInTheDocument()
  })

  it('shows hint button after 2 attempts', () => {
    render(
      <ProblemPanel 
        problem={mockProblem} 
        timeSeconds={0}
        attempts={2}
        hint={null}
        loadingHint={false}
        onShowHint={jest.fn()}
      />
    )
    
    expect(screen.getByText(/Show Hint/i)).toBeInTheDocument()
  })
})
