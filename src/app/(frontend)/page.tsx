import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch published posts
  const posts = await payload.find({
    collection: 'posts',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: 10,
  })

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1 className="blog-title">Blog</h1>
        <p className="blog-subtitle">Thoughts on AI, local LLMs, and web development</p>
      </header>

      <main className="blog-main">
        {posts.docs.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Create your first post in the admin panel!</p>
            <a href={`${payloadConfig.routes.admin}/collections/posts`} className="btn-primary">
              Create Post
            </a>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.docs.map((post) => (
              <article key={post.id} className="post-card">
                <Link href={`/posts/${post.slug}`} className="post-link">
                  {post.featuredImage && typeof post.featuredImage === 'object' && (
                    <div className="post-image">
                      <Image
                        src={post.featuredImage.url || ''}
                        alt={post.featuredImage.alt}
                        fill
                        className="image-cover"
                      />
                    </div>
                  )}
                  <div className="post-content">
                    <h2 className="post-title">{post.title}</h2>
                    {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
                    <div className="post-meta">
                      <time dateTime={post.publishedAt || ''}>
                        {new Date(post.publishedAt || '').toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      {post.tags && post.tags.length > 0 && (
                        <div className="post-tags">
                          {post.tags.map((tagObj, i) => (
                            <span key={i} className="tag">
                              {tagObj.tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="blog-footer">
        <p>
          Powered by <a href="https://payloadcms.com">Payload CMS</a>
        </p>
      </footer>
    </div>
  )
}
