 import { cn } from "@/lib/utils";
import { RecentBlogCard } from "./elements/RecentBlogCard";

function RecentBlogs() {
  return (
    <div className="bg-white py-14 ">
      <div className="container flex flex-col gap-5">
        <h3
          className={cn(
            "text-center lg:text-3xl  text-2xl  font-medium",
            "quicksand-medium"
          )}
        >
          Recent <span className="text-secondary font-semibold">Blogs</span>
        </h3>
        <div className="grid lg:grid-cols-3 gap-5 mt-3">
          <RecentBlogCard></RecentBlogCard>
          <RecentBlogCard></RecentBlogCard>
          <RecentBlogCard></RecentBlogCard>
        </div>
      </div>
    </div>
  );
}

export default RecentBlogs;
