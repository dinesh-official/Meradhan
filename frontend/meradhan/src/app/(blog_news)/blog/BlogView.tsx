import React from "react";
import BlogPageFIlterOrSort from "./_components/BlogPageFIlterOrSort";
import { cn } from "@/lib/utils";
import { quicksand } from "@/global/font/font";
import PostCard from "../_components/PostCard";

function BlogView() {
  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl font-medium", quicksand.className)}>
          MeraDhan <span className="text-secondary font-semibold">Blogs</span>
        </h1>
        <BlogPageFIlterOrSort />
      </div>

      <div className="flex flex-col gap-5 gap-y-8">
        <PostCard />
        <div className="grid md:grid-cols-3 gap-5 gap-y-8">
          <PostCard listMode />
          <PostCard listMode />
          <PostCard listMode />
          <PostCard listMode />
          <PostCard listMode />
          <PostCard listMode />
        </div>
      </div>
    </div>
  );
}

export default BlogView;
