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
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FaCalendarAlt } from "react-icons/fa";
import { FaClock, FaEye } from "react-icons/fa6";
import { RiShareFill } from "react-icons/ri";
import AvatarDetailCard from "../../_components/AvatarDatialCard";
import PostCard from "../../_components/PostCard";

function page() {
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
              <BreadcrumbLink href="/blog">News</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>What Is Credit Rating in Bonds?</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-5 py-10">
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-5">
            <div className="flex justify-between lg:justify-start items-center gap-5 w-full lg:w-auto">
              <Badge className="bg-[#7fabd2] px-4 py-1.5 rounded-xl text-md text-sm">
                Educative
              </Badge>
              <div className="flex items-center gap-2 text-gray-500">
                <div>
                  <FaCalendarAlt size={18} />
                </div>
                <p>13 Jun 2025</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <FaClock size={18} /> <p>5 min read</p>
              </div>
            </div>
            <div className="flex justify-between lg:justify-end items-center gap-5 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-gray-500">
                <FaEye size={18} /> <p>9</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <RiShareFill size={18} />
              </div>
            </div>
          </div>
          <h1 className={cn("text-2xl lg:text-4xl quicksand-medium")}>
            What Is Credit Rating in Bonds?
          </h1>
          <Image
            src="/avatars/blogpage.png"
            alt="Blog"
            width={1300}
            height={900}
            className="rounded-xl w-full object-cover aspect-video"
          />

          <div className="gap-5 grid lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p>
                When you’re investing in bonds, one of the first things you
                might come across is a credit rating. This rating acts like a
                report card for the bond. It tells you how likely it is that the
                issuer (the company or government borrowing money) will repay
                your investment on time.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <p>Tags:</p>
                <Badge variant={`secondary`}>investing in bonds</Badge>
                <Badge variant={`secondary`}>#Bond</Badge>
                <Badge variant={`secondary`}>#Bond</Badge>
                <Badge variant={`secondary`}>#Bond</Badge>
                <Badge variant={`secondary`}>#Bond</Badge>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-4 w-full">
                <AvatarDetailCard />
                <div className="">
                  <p className="mb-5 text-gray-500 text-sm">Related News:</p>
                  <div className="flex flex-col gap-5">
                    <PostCard
                      listMode
                      src="/static/bondYield.png"
                      badge="Educative"
                      createAt="24 Oct 2025"
                      heading="What Are Bonds? A Simple Guide for Indian Investors"
                      description="Bonds are one of the most trusted and popular investment instruments, especially among investors seeking safety, stability, and a predictable income stream. Despite their popularity, many Indian investors often find themselves puzzled by how bonds work and how they fit into their financial plans. updated"
                      name="Vikas Kukreja"
                      profilePic="/avatars/person.jpeg"
                      views="10"
                      slug="/news/slug"
                    />
                    <PostCard
                      listMode
                      src="/static/bondYield.png"
                      badge="Educative"
                      createAt="24 Oct 2025"
                      heading="What Are Bonds? A Simple Guide for Indian Investors"
                      description="Bonds are one of the most trusted and popular investment instruments, especially among investors seeking safety, stability, and a predictable income stream. Despite their popularity, many Indian investors often find themselves puzzled by how bonds work and how they fit into their financial plans. updated"
                      name="Vikas Kukreja"
                      profilePic="/avatars/person.jpeg"
                      views="10"
                      slug="/news/slug"
                    />
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
