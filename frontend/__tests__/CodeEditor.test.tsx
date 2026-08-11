import { render, screen } from '@testing-library/react'
import CodeEditor from '@/components/CodeEditor'

const mockLanguages = [
  { id: 71, name: 'python', label: 'Python 3', defaultCode: '# python code' },
  { id: 63, name: 'javascript', label: 'JavaScript', defaultCode: '// js code' }
]

// Mock the Monaco Editor so it doesn't fail in JSDOM
jest.mock('@monaco-editor/react', () => {
  return function MockEditor({ value }: { value: string }) {
    return <div data-testid="monaco-editor">{value}</div>
  }
})

describe('CodeEditor', () => {
  it('renders correctly and shows selected language', () => {
    render(
      <CodeEditor 
        lang={mockLanguages[0]}
        languages={mockLanguages}
        code="# python code"
        executing={false}
        onLanguageChange={jest.fn()}
        onCodeChange={jest.fn()}
        onResetCode={jest.fn()}
        onRunCode={jest.fn()}
      />
    )
    
    // Check toolbar elements
    expect(screen.getByTestId('language-select')).toBeInTheDocument()
    expect(screen.getByText('Python 3')).toBeInTheDocument()
    expect(screen.getByText('Run Code')).toBeInTheDocument()
    
    // Check mocked editor value
    expect(screen.getByTestId('monaco-editor')).toHaveTextContent('# python code')
  })
})
