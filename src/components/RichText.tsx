'use client'

import React from 'react'

interface RichTextProps {
  content: any
}

export function RichText({ content }: RichTextProps) {
  if (!content || !content.root) {
    return null
  }

  return (
    <div className="rich-text">
      {content.root.children.map((node: any, index: number) => (
        <NodeRenderer key={index} node={node} />
      ))}
    </div>
  )
}

function NodeRenderer({ node }: { node: any }) {
  if (!node) return null

  switch (node.type) {
    case 'heading': {
      const level = node.tag || 1
      const children = renderChildren(node.children)
      if (level === 1) return <h1 className="heading-h1">{children}</h1>
      if (level === 2) return <h2 className="heading-h2">{children}</h2>
      if (level === 3) return <h3 className="heading-h3">{children}</h3>
      if (level === 4) return <h4 className="heading-h4">{children}</h4>
      if (level === 5) return <h5 className="heading-h5">{children}</h5>
      return <h6 className="heading-h6">{children}</h6>
    }

    case 'paragraph':
      return <p>{renderChildren(node.children)}</p>

    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'
      return (
        <ListTag className={node.listType === 'bullet' ? 'list-bullet' : 'list-number'}>
          {node.children?.map((item: any, i: number) => (
            <li key={i}>{renderChildren(item.children)}</li>
          ))}
        </ListTag>
      )
    }

    case 'horizontalrule':
      return <hr />

    case 'quote':
      return <blockquote>{renderChildren(node.children)}</blockquote>

    case 'code':
      return (
        <pre>
          <code>{node.code}</code>
        </pre>
      )

    default:
      return null
  }
}

function renderChildren(children: any[]) {
  if (!children) return null

  return children.map((child, index) => {
    if (child.type === 'text') {
      let text: React.ReactNode = child.text
      if (child.format === 1) {
        text = <strong key={index}>{text}</strong>
      }
      if (child.format === 2) {
        text = <em key={index}>{text}</em>
      }
      if (child.format === 3) {
        text = (
          <strong key={index}>
            <em>{text}</em>
          </strong>
        )
      }
      if (child.format === 4) {
        text = <u key={index}>{text}</u>
      }
      if (child.format === 5) {
        text = (
          <code key={index} className="inline-code">
            {text}
          </code>
        )
      }
      return <React.Fragment key={index}>{text}</React.Fragment>
    }

    if (child.type === 'linebreak') {
      return <br key={index} />
    }

    if (child.type === 'link') {
      return (
        <a key={index} href={child.url} target="_blank" rel="noopener noreferrer">
          {renderChildren(child.children)}
        </a>
      )
    }

    return null
  })
}
