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
import { quicksand } from "@/global/font/font";
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
        <div className="flex flex-col gap-5  py-10">
          <div className="flex gap-5 justify-between items-center lg:flex-nowrap flex-wrap  ">
            <div className="flex  gap-5 lg:justify-start lg:w-auto w-full justify-between items-center">
              <Badge className="py-1.5 px-4 text-md bg-[#7fabd2] text-sm rounded-xl">
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
            <div className="flex lg:justify-end justify-between lg:w-auto w-full  gap-5 items-center">
              <div className="flex items-center gap-2 text-gray-500">
                <FaEye size={18} /> <p>9</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <RiShareFill size={18} />
              </div>
            </div>
          </div>
          <h1
            className={cn(
              "lg:text-4xl text-2xl font-medium",
              quicksand.className
            )}
          >
            What Is Credit Rating in Bonds?
          </h1>
          <Image
            src="/avatars/blogpage.png"
            alt="Blog"
            width={1300}
            height={900}
            className="w-full rounded-xl aspect-video object-cover"
          />

          <div className="grid lg:grid-cols-3 gap-5">
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
              <div className=" w-full flex flex-col gap-4">
                <AvatarDetailCard />
                <div className="">
                  <p className="text-sm text-gray-500 mb-5">Related News:</p>
                  <div className="flex flex-col gap-5">
                    <PostCard listMode />
                    <PostCard listMode />
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
