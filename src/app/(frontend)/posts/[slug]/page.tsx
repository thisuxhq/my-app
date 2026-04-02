import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

import config from '@payload-config'
import { RichText } from '@/components/RichText'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    depth: 2,
    limit: 1,
  })

  const post = posts.docs[0]

  if (!post) {
    notFound()
  }

  return (
    <article className="post-page">
      <div className="post-container">
        <Link href="/" className="back-link">
          ← Back to blog
        </Link>

        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>

          <div className="post-meta">
            <time dateTime={post.publishedAt || ''} className="post-date">
              {new Date(post.publishedAt || '').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            {typeof post.author === 'object' && post.author && (
              <span className="post-author">by {post.author.email}</span>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tagObj, i) => (
                <span key={i} className="tag">
                  {tagObj.tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.featuredImage && typeof post.featuredImage === 'object' && (
          <div className="featured-image">
            <Image
              src={post.featuredImage.url || ''}
              alt={post.featuredImage.alt}
              fill
              className="image-cover"
              priority
            />
          </div>
        )}

        {post.content && (
          <div className="post-body">
            <RichText content={post.content} />
          </div>
        )}

        <footer className="post-footer">
          <Link href="/" className="back-link">
            ← Back to all posts
          </Link>
        </footer>
      </div>
    </article>
  )
}
