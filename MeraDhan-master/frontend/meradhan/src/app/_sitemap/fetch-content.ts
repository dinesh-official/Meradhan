import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import type { SitemapEntry } from "./types";
import { createSitemapEntry } from "./utils";

/**
 * GraphQL query to fetch all blog posts
 */
const BLOGS_QUERY = gql`
  query GetAllBlogs($pagination: PaginationArg) {
    blogPosts_connection(pagination: $pagination) {
      nodes {
        Slug
        updatedAt
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

/**
 * GraphQL query to fetch all news posts
 */
const NEWS_QUERY = gql`
  query GetAllNews($pagination: PaginationArg) {
    newsPosts_connection(pagination: $pagination) {
      nodes {
        Slug
        updatedAt
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

/**
 * GraphQL query to fetch all issuer notes
 */
const ISSUER_NOTES_QUERY = gql`
  query GetAllIssuerNotes($pagination: PaginationArg) {
    issuerNotes_connection(pagination: $pagination) {
      nodes {
        Slug
        updatedAt
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

/**
 * GraphQL query to fetch all blog categories
 */
const BLOG_CATEGORIES_QUERY = gql`
  query GetAllBlogCategories($pagination: PaginationArg) {
    blogCategories_connection(pagination: $pagination) {
      nodes {
        Slug
        updatedAt
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

/**
 * GraphQL query to fetch all news categories
 */
const NEWS_CATEGORIES_QUERY = gql`
  query GetAllNewsCategories($pagination: PaginationArg) {
    newsCategories_connection(pagination: $pagination) {
      nodes {
        Slug
        updatedAt
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

/**
 * GraphQL query to fetch all regulatory circulars categories
 */
const REGULATORY_CATEGORIES_QUERY = gql`
  query GetAllRegulatoryCategories($pagination: PaginationArg) {
    regulatoryCircularsCategories_connection(pagination: $pagination) {
      nodes {
        Slug
        updatedAt
      }
      pageInfo {
        total
        page
        pageSize
        pageCount
      }
    }
  }
`;

/**
 * Fetch all blog posts for sitemap
 */
export async function fetchBlogsForSitemap(): Promise<SitemapEntry[]> {
  try {
    const blogs: SitemapEntry[] = [];
    const pageSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await gqlClient.query<{
          blogPosts_connection: {
            nodes: Array<{
              Slug: string;
              updatedAt: string;
            }>;
            pageInfo: {
              total: number;
              page: number;
              pageSize: number;
              pageCount: number;
            };
          };
        }>({
          query: BLOGS_QUERY,
          variables: {
            pagination: {
              pageSize,
              page,
            },
          },
        });

        if (
          !data?.blogPosts_connection?.nodes ||
          data.blogPosts_connection.nodes.length === 0
        ) {
          hasMore = false;
          break;
        }

        // Create sitemap entries for each blog post
        for (const blog of data.blogPosts_connection.nodes) {
          if (blog.Slug) {
            blogs.push(
              createSitemapEntry(`/blog/${blog.Slug}`, {
                lastModified: blog.updatedAt
                  ? new Date(blog.updatedAt)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.8,
              })
            );
          }
        }

        // Check if there are more pages
        const pageInfo = data.blogPosts_connection.pageInfo;
        if (page >= pageInfo.pageCount) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }

    return blogs;
  } catch {
    return [];
  }
}

/**
 * Fetch all news posts for sitemap
 */
export async function fetchNewsForSitemap(): Promise<SitemapEntry[]> {
  try {
    const news: SitemapEntry[] = [];
    const pageSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await gqlClient.query<{
          newsPosts_connection: {
            nodes: Array<{
              Slug: string;
              updatedAt: string;
            }>;
            pageInfo: {
              total: number;
              page: number;
              pageSize: number;
              pageCount: number;
            };
          };
        }>({
          query: NEWS_QUERY,
          variables: {
            pagination: {
              pageSize,
              page,
            },
          },
        });

        if (
          !data?.newsPosts_connection?.nodes ||
          data.newsPosts_connection.nodes.length === 0
        ) {
          hasMore = false;
          break;
        }

        // Create sitemap entries for each news post
        for (const newsPost of data.newsPosts_connection.nodes) {
          if (newsPost.Slug) {
            news.push(
              createSitemapEntry(`/news/${newsPost.Slug}`, {
                lastModified: newsPost.updatedAt
                  ? new Date(newsPost.updatedAt)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.8,
              })
            );
          }
        }

        // Check if there are more pages
        const pageInfo = data.newsPosts_connection.pageInfo;
        if (page >= pageInfo.pageCount) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }

    return news;
  } catch {
    return [];
  }
}

/**
 * Fetch all issuer notes for sitemap
 */
export async function fetchIssuerNotesForSitemap(): Promise<SitemapEntry[]> {
  try {
    const issuerNotes: SitemapEntry[] = [];
    const pageSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await gqlClient.query<{
          issuerNotes_connection: {
            nodes: Array<{
              Slug: string;
              updatedAt: string;
            }>;
            pageInfo: {
              total: number;
              page: number;
              pageSize: number;
              pageCount: number;
            };
          };
        }>({
          query: ISSUER_NOTES_QUERY,
          variables: {
            pagination: {
              pageSize,
              page,
            },
          },
        });

        if (
          !data?.issuerNotes_connection?.nodes ||
          data.issuerNotes_connection.nodes.length === 0
        ) {
          hasMore = false;
          break;
        }

        // Create sitemap entries for each issuer note
        for (const note of data.issuerNotes_connection.nodes) {
          if (note.Slug) {
            issuerNotes.push(
              createSitemapEntry(`/issuer-notes/${note.Slug}`, {
                lastModified: note.updatedAt
                  ? new Date(note.updatedAt)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
              })
            );
          }
        }

        // Check if there are more pages
        const pageInfo = data.issuerNotes_connection.pageInfo;
        if (page >= pageInfo.pageCount) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }

    return issuerNotes;
  } catch {
    return [];
  }
}

/**
 * Fetch all blog category pages for sitemap
 */
export async function fetchBlogCategoriesForSitemap(): Promise<SitemapEntry[]> {
  try {
    const categories: SitemapEntry[] = [];
    const pageSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await gqlClient.query<{
          blogCategories_connection: {
            nodes: Array<{
              Slug: string;
              updatedAt: string;
            }>;
            pageInfo: {
              total: number;
              page: number;
              pageSize: number;
              pageCount: number;
            };
          };
        }>({
          query: BLOG_CATEGORIES_QUERY,
          variables: {
            pagination: {
              pageSize,
              page,
            },
          },
        });

        if (
          !data?.blogCategories_connection?.nodes ||
          data.blogCategories_connection.nodes.length === 0
        ) {
          hasMore = false;
          break;
        }

        // Create sitemap entries for each blog category
        for (const category of data.blogCategories_connection.nodes) {
          if (category.Slug) {
            categories.push(
              createSitemapEntry(`/blog/category/${category.Slug}`, {
                lastModified: category.updatedAt
                  ? new Date(category.updatedAt)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
              })
            );
          }
        }

        // Check if there are more pages
        const pageInfo = data.blogCategories_connection.pageInfo;
        if (page >= pageInfo.pageCount) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }

    return categories;
  } catch {
    return [];
  }
}

/**
 * Fetch all news category pages for sitemap
 */
export async function fetchNewsCategoriesForSitemap(): Promise<SitemapEntry[]> {
  try {
    const categories: SitemapEntry[] = [];
    const pageSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await gqlClient.query<{
          newsCategories_connection: {
            nodes: Array<{
              Slug: string;
              updatedAt: string;
            }>;
            pageInfo: {
              total: number;
              page: number;
              pageSize: number;
              pageCount: number;
            };
          };
        }>({
          query: NEWS_CATEGORIES_QUERY,
          variables: {
            pagination: {
              pageSize,
              page,
            },
          },
        });

        if (
          !data?.newsCategories_connection?.nodes ||
          data.newsCategories_connection.nodes.length === 0
        ) {
          hasMore = false;
          break;
        }

        // Create sitemap entries for each news category
        for (const category of data.newsCategories_connection.nodes) {
          if (category.Slug) {
            categories.push(
              createSitemapEntry(`/news/category/${category.Slug}`, {
                lastModified: category.updatedAt
                  ? new Date(category.updatedAt)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
              })
            );
          }
        }

        // Check if there are more pages
        const pageInfo = data.newsCategories_connection.pageInfo;
        if (page >= pageInfo.pageCount) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }

    return categories;
  } catch {
    return [];
  }
}

/**
 * Fetch all regulatory circulars category pages for sitemap
 */
export async function fetchRegulatoryCategoriesForSitemap(): Promise<
  SitemapEntry[]
> {
  try {
    const categories: SitemapEntry[] = [];
    const pageSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await gqlClient.query<{
          regulatoryCircularsCategories_connection: {
            nodes: Array<{
              Slug: string;
              updatedAt: string;
            }>;
            pageInfo: {
              total: number;
              page: number;
              pageSize: number;
              pageCount: number;
            };
          };
        }>({
          query: REGULATORY_CATEGORIES_QUERY,
          variables: {
            pagination: {
              pageSize,
              page,
            },
          },
        });

        if (
          !data?.regulatoryCircularsCategories_connection?.nodes ||
          data.regulatoryCircularsCategories_connection.nodes.length === 0
        ) {
          hasMore = false;
          break;
        }

        // Create sitemap entries for each regulatory circulars category
        for (const category of data.regulatoryCircularsCategories_connection
          .nodes) {
          if (category.Slug) {
            categories.push(
              createSitemapEntry(`/regulatory-circulars/${category.Slug}`, {
                lastModified: category.updatedAt
                  ? new Date(category.updatedAt)
                  : new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
              })
            );
          }
        }

        // Check if there are more pages
        const pageInfo = data.regulatoryCircularsCategories_connection.pageInfo;
        if (page >= pageInfo.pageCount) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }

    return categories;
  } catch {
    return [];
  }
}
