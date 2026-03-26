import NotFound from "@/app/not-found";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { CMS_URL, HOST_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import {
  calculateReadTime,
  dateTimeUtils,
} from "@/global/utils/datetime.utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FaCalendarAlt } from "react-icons/fa";
import { FaClock, FaEye } from "react-icons/fa6";
import { RiShareFill } from "react-icons/ri";
import AvatarDetailCard from "../../_components/AvatarDatialCard";
import PostCard from "../../_components/PostCard";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";
import {
  addNewsViews,
  fetchNewsPostData,
  fetchNewsPostMetaData,
  fetchReletedNews,
} from "../_gql/news.gql";

export const revalidate = 0; // Revalidate the page every hour
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return await fetchNewsPostMetaData(slug);
};

async function page({ params }: { params: Promise<{ slug: string }> }) {
  const post = await fetchNewsPostData((await params).slug);
  if (!post?.Slug) {
    return NotFound();
  }
  const relatedNews = await fetchReletedNews(
    post?.news_category?.Slug || "",
    post?.Slug
  );
  await addNewsViews(post?.documentId, post?.Views + 1);
  return (
    <ViewPort>
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/news">News</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post?.Title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-5 py-10">
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-5 text-sm">
            <div className="flex justify-between lg:justify-start items-center gap-5 w-full lg:w-auto">
              <Badge className="bg-primary px-4 py-1.5 rounded-lg  ">
                {post?.news_category?.Name || "General"}
              </Badge>
              <div className="flex items-center gap-2 text-gray-500">
                <div>
                  <FaCalendarAlt size={18} />
                </div>
                <p>
                  {post?.createdAt &&
                    dateTimeUtils.formatDateTime(
                      post?.createdAt,
                      "DD MMM YYYY"
                    )}
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <FaClock size={18} />{" "}
                <p>
                  {calculateReadTime(
                    post.Contents.Introduction +
                      post.Contents.Content_1 +
                      post.Contents.Content_2
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-between lg:justify-end items-center gap-5 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-gray-500">
                <FaEye size={18} /> <p>{post?.Views}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <SharePopupTrigger
                  title="Share News"
                  url={`${HOST_URL}/news/${post.Slug}`}
                >
                  <RiShareFill size={18} className="cursor-pointer" />
                </SharePopupTrigger>
              </div>
            </div>
          </div>
          <h1 className={cn("text-2xl lg:text-4xl quicksand-medium")}>
            {post?.Title}
          </h1>
          <Image
            src={
              CMS_URL + (post?.Featured_Image?.url || "/static/bondYield.png")
            }
            alt="Blog"
            width={1300}
            height={900}
            className="rounded-xl w-full object-cover aspect-video"
          />

          <div className="gap-5 grid lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div
                className="prose prose-lg max-w-none article"
                dangerouslySetInnerHTML={{
                  __html: sanitizeStrapiHTML(post?.Contents.Introduction),
                }}
              />
              <div
                className="prose prose-lg max-w-none article"
                dangerouslySetInnerHTML={{
                  __html: sanitizeStrapiHTML(post?.Contents.Content_1),
                }}
              />{" "}
              <div
                className="prose prose-lg max-w-none article"
                dangerouslySetInnerHTML={{
                  __html: sanitizeStrapiHTML(post?.Contents.Content_2),
                }}
              />
              {post?.Tags && post?.Tags.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-medium mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post?.Tags.map((tag) => (
                      <Badge
                        key={tag.name}
                        className="bg-secondary/10 text-secondary px-3 py-1 rounded-full"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-4 w-full">
                <AvatarDetailCard
                  facebookUrl={post?.Author?.Facebook_Link}
                  instagramUrl={post?.Author?.Instagram_Link}
                  linkedinUrl={post?.Author?.LinkedIn_Link}
                  twitterUrl={post?.Author?.X_Link}
                  name={post?.Author?.Name}
                  position={post?.Author?.Position}
                  share={`/news/${post.Slug}`}
                  type="news"
                  image={
                    CMS_URL +
                    (post?.Author?.Profile_Image?.url || "/avatars/person.jpeg")
                  }
                />
                <div className="">
                  <p className="mb-5 text-gray-500 text-sm">Related News:</p>
                  <div className="flex flex-col gap-5">
                    {relatedNews?.nodes?.map((news) => (
                      <PostCard
                        key={news.Slug}
                        type="news"
                        listMode
                        src={
                          CMS_URL +
                          (news.Featured_Image?.url || "/static/bondYield.png")
                        }
                        badge={news.news_category?.Name || "General"}
                        createAt={dateTimeUtils.formatDateTime(
                          news.createdAt,
                          "DD MMM YYYY"
                        )}
                        heading={news.Title}
                        description={news.Description}
                        name={news.Author?.Name || "Admin"}
                        profilePic={
                          CMS_URL +
                          (news.Author?.Profile_Image?.url ||
                            "/avatars/person.jpeg")
                        }
                        views={news.Views.toString()}
                        slug={`/news/${news.Slug}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
