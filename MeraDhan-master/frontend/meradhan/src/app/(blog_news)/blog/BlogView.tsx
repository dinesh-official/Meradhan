import { strAssets } from "@/core/connection/apollo-client";
import { cn } from "@/lib/utils";
import PostCard from "../_components/PostCard";
import BlogPageFIlterOrSort from "./_components/BlogPageFIlterOrSort";
import Pagination from "./_components/Pagination";
import { fetchBlogsData } from "./_gql/blogs.gql";

export const revalidate = 0;
async function BlogView({
  page,
  sort,
  categoryName,
}: {
  page?: string;
  sort?: string;
  categoryName?: string;
}) {
  const data = await fetchBlogsData({
    page: page ? Number(page) : 1,
    sort: sort,
    categoryName: categoryName,
  });

  const items = data?.blogPosts_connection.nodes;
  const categories = data?.blogCategories_connection;
  const pageInfo = data?.blogPosts_connection.pageInfo;

  const renderPosts = () => {
    if (items && items.length > 0) {
      return (
        <div className="flex flex-col gap-5 gap-y-8">
          <PostCard
            listMode
            src={`${strAssets}${items[0]?.Featured_Image?.url}`}
            badge={items[0]?.Category?.Name || "General"}
            createAt={new Date(items[0]?.createdAt ?? "").toDateString()}
            heading={items[0]?.Title || "Untitled"}
            description={items[0]?.Description || "No description available."}
            name={items[0]?.Author?.Name || "Unknown Author"}
            profilePic={`${strAssets}${items[0]?.Author?.Profile_Image?.url}`}
            views={String(items[0]?.Views ?? 0)}
            slug={"/blog/" + items[0]?.Slug}
            categorySlug={items[0]?.Category.Slug}
          />
          <div className="gap-5 gap-y-5 grid md:grid-cols-3">
            {items.slice(1).map((item) => (
              <PostCard
                key={item.documentId}
                listMode
                slug={"/blog/" + item.Slug}
                src={`${strAssets}${item.Featured_Image?.url}`}
                badge={item.Category?.Name || "General"}
                createAt={new Date(item.createdAt).toDateString()}
                heading={item.Title}
                description={item.Description}
                name={item.Author?.Name || "Anonymous"}
                profilePic={`${strAssets}${item.Author?.Profile_Image?.url}`}
                views={String(item.Views ?? 0)}
                categorySlug={item.Category.Slug}
              />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full flex justify-center items-center gap-5 h-60">
          <p>No blog posts found.</p>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl quicksand-medium")}>
          {categoryName ? (
            data?.blogPosts_connection?.nodes?.[0]?.Category?.Name
          ) : (
            <>
              {" "}
              MeraDhan{" "}
              <span className="font-semibold text-secondary">Blogs</span>
            </>
          )}
        </h1>
        <BlogPageFIlterOrSort
          category={categories?.nodes || []}
          sort={sort || "latest"}
          categoryName={categoryName}
        />
      </div>
      {renderPosts()}
      <Pagination pageInfo={pageInfo} categoryName={categoryName} />
    </div>
  );
}

export default BlogView;
