import { strAssets } from "@/core/connection/apollo-client";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { cn } from "@/lib/utils";
import PostCard from "../_components/PostCard";
import NewsPageFIlterOrSort from "./_components/NewsPageFIlterOrSort";
import Pagination from "./_components/Pagination";
import { fetchNewsData } from "./_gql/news.gql";

export const revalidate = 0;
async function NewsView({
  page,
  sort,
  categoryName,
}: {
  page?: string;
  sort?: string;
  categoryName?: string;
}) {
  let data, items, pageInfo;
  try {
    data = await fetchNewsData({
      page: page ? Number(page) : 1,
      sort,
      categoryName,
    });
    items = data?.newsPosts_connection?.nodes || [];
    pageInfo = data?.newsPosts_connection?.pageInfo;
  } catch {
    return (
      <div className="pt-10 text-center text-red-500">
        <h2>Error loading news. Please try again later.</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl quicksand-medium")}>
          {categoryName ? (
            items?.[0]?.news_category?.Name
          ) : (
            <>
              {" "}
              MeraDhan{" "}
              <span className="font-semibold text-secondary">News</span>
            </>
          )}
        </h1>
        <NewsPageFIlterOrSort
          category={data?.newsCategories_connection.nodes || []}
          categoryName={categoryName}
          sort={sort || "latest"}
        />
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-5 gap-y-8">
          <PostCard
            listMode
            src={`${strAssets}${items[0]?.Featured_Image?.url}`}
            badge={items[0]?.news_category?.Name || "General"}
            createAt={new Date(items[0]?.createdAt ?? "").toDateString()}
            heading={items[0]?.Title || "Untitled"}
            description={items[0]?.Description || "No description available."}
            name={items[0]?.Author?.Name || "Unknown Author"}
            profilePic={`${strAssets}${items[0]?.Author?.Profile_Image?.url}`}
            views={String(items[0]?.Views ?? 0)}
            slug={"/news/" + items[0]?.Slug}
            type="news"
          />
          <div className="gap-5 gap-y-8 grid md:grid-cols-3">
            {items.slice(1).map((item) => (
              <PostCard
                key={item.documentId}
                listMode
                src={`${strAssets}${item?.Featured_Image?.url}`}
                badge={item.news_category?.Name || "General"}
                createAt={dateTimeUtils.formatDateTime(
                  item.createdAt,
                  "DD MMM YYYY"
                )}
                heading={item.Title}
                description={item.Description}
                name={item.Author?.Name || "Anonymous"}
                profilePic={`${strAssets}${item.Author?.Profile_Image?.url}`}
                views={String(item.Views ?? 0)}
                slug={"/news/" + item?.Slug}
                type="news"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500">
          <h2>No news articles found.</h2>
        </div>
      )}
      <Pagination
        pageInfo={{
          page: pageInfo?.page,
          pageCount: pageInfo?.pageCount,
        }}
      />
    </div>
  );
}

export default NewsView;
