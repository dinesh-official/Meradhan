"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { T_News_GQL_RESPONSE } from "../_gql/news.gql";

function NewsPageFIlterOrSort({
  category,
  sort,
  categoryName,
}: {
  category: T_News_GQL_RESPONSE["newsCategories_connection"]["nodes"];
  sort?: string;
  categoryName?: string;
}) {
  return (
    <div className="flex justify-between items-center py-5">
      <Select
        defaultValue="all"
        onValueChange={(e) => {
          if (e === "all") {
            window.location.href = `/news`;
          } else {
            window.location.href = `/news/category/${e}`;
          }
        }}
        value={categoryName || "all"}
      >
        <SelectTrigger className="md:w-[240px] w-44 shadow-none border-1 border-gray-200">
          <SelectValue placeholder="All Articles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Articles</SelectItem>
          {category.map((cat) => (
            <SelectItem key={cat.Slug} value={cat.Slug}>
              {cat.Name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={sort || "latest"}
        onValueChange={(e) => {
          window.location.href = `/news?sort=${e}`;
        }}
      >
        <SelectTrigger className="md:w-[200px] w-44 shadow-none bg-muted border-0 border-gray-200">
          <SelectValue
            placeholder={
              "Sort By : " + (sort === "view" ? "Most Viewed" : "Latest")
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Sort By : Latest</SelectItem>
          <SelectItem value="view">Sort By : Most Viewed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default NewsPageFIlterOrSort;
