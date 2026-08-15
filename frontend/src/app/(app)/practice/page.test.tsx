import { render, screen } from '@testing-library/react';
import PracticePage from './page';

// Mock the fetchApi and navigation
jest.mock('@/lib/api', () => ({
  fetchApi: jest.fn().mockResolvedValue({
    data: {
      problem_id: 'p1',
      title: 'Test Problem',
      description: 'Test description',
      solution_code: 'def test(): pass'
    }
  })
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('PracticePage', () => {
  it('renders loading state initially', () => {
    render(<PracticePage />);
    expect(screen.getByText(/loading next problem/i)).toBeInTheDocument();
  });
});
