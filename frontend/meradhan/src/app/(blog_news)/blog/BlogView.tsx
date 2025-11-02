import { strAssets } from "@/core/connection/apollo-client";
import { cn } from "@/lib/utils";
import PostCard from "../_components/PostCard";
import BlogPageFIlterOrSort from "./_components/BlogPageFIlterOrSort";
import { fetchBlogsData } from "./_gql/blogs.gql";

export const revalidate = 0;
async function BlogView() {
  const data = await fetchBlogsData();
  const items = data?.blogPosts_connection.nodes;
  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl quicksand-medium")}>
          MeraDhan <span className="font-semibold text-secondary">Blogs</span>
        </h1>
        <BlogPageFIlterOrSort />
      </div>
      {items && (
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
            slug={"/blog/url-slug"}
          />
          <div className="gap-5 gap-y-5 grid md:grid-cols-3">
            {items.slice(1).map((item) => (
              <PostCard
                key={item.documentId}
                listMode
                slug="/blog/url-slug"
                src={`${strAssets}${items[0]?.Featured_Image?.url}`}
                badge={item.Category?.Name || "General"}
                createAt={new Date(item.createdAt).toDateString()}
                heading={item.Title}
                description={item.Description}
                name={item.Author?.Name || "Anonymous"}
                profilePic={`${strAssets}${items[0]?.Author?.Profile_Image?.url}`}
                views={String(item.Views ?? 0)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogView;
