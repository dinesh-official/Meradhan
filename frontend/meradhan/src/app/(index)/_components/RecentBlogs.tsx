import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { RecentBlogCard } from "./elements/RecentBlogCard";

function RecentBlogs() {
  return (
    <SectionWrapper>
      <div className="flex flex-col gap-5 container">
        <SectionTitleDesc
          title={
            <>
              Recent <span className="font-semibold text-secondary">Blogs</span>
            </>
          }
          description="See what our users are saying—real stories from real investors who’ve
          found success with MeraDhan."
        />

        <div className="gap-5 grid lg:grid-cols-3 mt-3">
          <RecentBlogCard></RecentBlogCard>
          <RecentBlogCard></RecentBlogCard>
          <RecentBlogCard></RecentBlogCard>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default RecentBlogs;
