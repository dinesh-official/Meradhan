import { Badge } from "@/components/ui/badge";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AuthorViewSharePostCard from "./AuthorViewSharePostCard";

interface PostCardProps {
  src: string;
  badge: string;
  createAt: string;
  heading: string;
  description: string;
  name: string;
  profilePic: string;
  views: string;
  listMode: boolean;
}
function PostCard({
  src,
  badge,
  createAt,
  heading,
  description,
  name,
  profilePic,
  views,
  listMode,
}: PostCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <Image
        src={src}
        alt="Blog"
        width={1300}
        height={900}
        className="w-full rounded-xl aspect-video object-cover"
      />
      <div className="flex justify-between items-center">
        <Badge className="py-1.5 px-4 text-[14px] bg-[#7fabd2] rounded-xl">
          {badge}
        </Badge>
        <p className="text-[14px]">{createAt}</p>
      </div>

      <h3
        className={cn(
          "lg:text-3xl text-[20px] font-medium text-primary line-clamp-2",
          quicksand.className,
          listMode && "lg:text-2xl"
        )}
      >
        {heading}
      </h3>
      <p className="text-gray-600 line-clamp-3 text-[16px]">{description}</p>

      <AuthorViewSharePostCard
        name={name}
        profilePic={profilePic}
        views={views}
      />
    </div>
  );
}

export default PostCard;
