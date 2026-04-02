import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 500,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        condition: (data) => data.status === 'published',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
  access: {
    read: ({ req: { user } }) => {
      // Public sees only published posts
      if (!user) return { status: { equals: 'published' } }
      // Authenticated sees all
      return true
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      // Admin can update all posts
      // Authors can update their own posts
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return {
        author: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      // Admin can delete all posts
      // Authors can delete their own posts
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return {
        author: { equals: user.id },
      }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Auto-generate slug from title if not provided
        if (!data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        }

        // Set publishedAt when status changes to published
        if (operation === 'create' && data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        if (
          operation === 'update' &&
          data.status === 'published' &&
          originalDoc?.status !== 'published' &&
          !data.publishedAt
        ) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
  timestamps: true,
}
