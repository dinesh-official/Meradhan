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
    <div className="flex flex-col gap-3">
      <Image
        src={src}
        alt="Blog"
        width={1300}
        height={900}
        className="rounded-xl w-full object-cover aspect-video"
      />
      <div className="flex justify-between items-center">
        <Badge className="bg-[#7fabd2] px-4 py-1.5 rounded-lg font-normal text-[12px]">
          {badge}
        </Badge>
        <p className="text-[14px]">{createAt}</p>
      </div>

      <h3
        className={cn(
          "font-medium text-[20px] text-primary line-clamp-2",
          quicksand.className,
        )}
      >
        {heading}
      </h3>
      <p className="mb-2 text-[16px] line-clamp-3">{description}</p>

      <AuthorViewSharePostCard
        name={name}
        profilePic={profilePic}
        views={views}
      />
    </div>
  );
}

export default PostCard;
