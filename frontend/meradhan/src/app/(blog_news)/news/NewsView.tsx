import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { quicksand } from "@/global/font/font";
import PostCard from "../_components/PostCard";
import NewsPageFIlterOrSort from "./_components/NewsPageFIlterOrSort";
import { fetchNewsData } from "./_gql/news.gql";
import { strAssets } from "@/core/connection/apollo-client";
import CardPagination from "@/global/elements/CardPagination";

async function NewsView() {
  const data = await fetchNewsData();
  const items = data?.newsPosts_connection.nodes;

  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl font-medium", quicksand.className)}>
          MeraDhan <span className="text-secondary font-semibold">News</span>
        </h1>
        <NewsPageFIlterOrSort />
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
          />
          <div className="grid md:grid-cols-3 gap-5 gap-y-8">
            {items.slice(1).map((item) => (
              <PostCard
                key={item.documentId}
                listMode
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
      {/* <CardPagination onClick={() => {}} page={1} totalPages={10} /> */}
    </div>
  );
}

export default NewsView;
