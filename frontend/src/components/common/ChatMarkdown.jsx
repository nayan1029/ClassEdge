import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders assistant chat replies as real Markdown — headings, bold, lists, and
// fenced code blocks — instead of a flat paragraph of raw ** and ``` characters.
export default function ChatMarkdown({ content }) {
  return (
    <div className="prose-chat text-sm leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          h1: ({ children }) => <h3 className="font-semibold text-base mt-2 mb-1">{children}</h3>,
          h2: ({ children }) => <h3 className="font-semibold text-base mt-2 mb-1">{children}</h3>,
          h3: ({ children }) => <h4 className="font-semibold mt-2 mb-1">{children}</h4>,
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 font-mono text-[0.85em]" {...props}>
                  {children}
                </code>
              )
            }
            const language = /language-(\w+)/.exec(className || '')?.[1]
            return (
              <div className="my-2 overflow-x-auto rounded-lg bg-gray-900 text-gray-100">
                {language && (
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-gray-400 border-b border-white/10">
                    {language}
                  </div>
                )}
                <pre className="p-3 text-xs leading-5">
                  <code className="font-mono" {...props}>{children}</code>
                </pre>
              </div>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
