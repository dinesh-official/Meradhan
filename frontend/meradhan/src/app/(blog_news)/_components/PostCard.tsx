import { Badge } from "@/components/ui/badge";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AuthorViewSharePostCard from "./AuthorViewSharePostCard";

function PostCard({ listMode }: { listMode?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Image
        src="/avatars/blogpage.png"
        alt="Blog"
        width={1300}
        height={900}
        className="w-full rounded-xl aspect-video object-cover"
      />
      <div className="flex justify-between items-center">
        <Badge className="py-1.5 px-4 text-md bg-[#7fabd2] text-sm rounded-xl">
          Educative
        </Badge>
        <p>02 May 2025</p>
      </div>

      <h3
        className={cn(
          "lg:text-3xl text-2xl font-medium text-primary line-clamp-2",
          quicksand.className,
          listMode && "lg:text-2xl"
        )}
      >
        What Are Bonds? A Simple Guide for Indian Investors
      </h3>
      <p className="text-gray-600 line-clamp-3">
        When you’re investing in bonds, one of the first things you might come
        across is a credit rating. This rating acts like a report card for the
        bond. It tells you how likely it is that the issuer (the company or
        government borrowing money) will repay your investment on time.
      </p>

      <AuthorViewSharePostCard />
    </div>
  );
}

export default PostCard;
