import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

function CodeRenderer({ content }) {
  if (!content) return null

  // Convert escaped newlines to actual newlines
  const unescapedContent = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t')

  // Extract code from code blocks - assume content starts with ```
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/
  const match = unescapedContent.match(codeBlockRegex)

  if (!match) {
    // If no code block found, treat entire content as code
    return (
      <div className="relative code-container">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-lg border border-border">
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              background: '#1e1e1e',
              minWidth: '100%',
              display: 'inline-block',
            }}
            wrapLines={false}
            wrapLongLines={false}
            showLineNumbers={true}
            codeTagProps={{
              style: {
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
              }
            }}
            PreTag={({ children }) => <pre style={{ margin: 0 }}>{children}</pre>}
          >
            {unescapedContent.trim()}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  }

  const language = match[1] || 'python'
  const code = match[2]

  return (
    <div className="relative code-container">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-lg border border-border">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            background: '#1e1e1e',
            minWidth: '100%',
            display: 'inline-block',
          }}
          wrapLines={false}
          wrapLongLines={false}
          showLineNumbers={true}
          codeTagProps={{
            style: {
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
            }
          }}
          PreTag={({ children }) => <pre style={{ margin: 0 }}>{children}</pre>}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeRenderer