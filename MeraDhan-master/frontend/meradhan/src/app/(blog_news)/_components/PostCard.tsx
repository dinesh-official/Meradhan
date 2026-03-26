import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AuthorViewSharePostCard from "./AuthorViewSharePostCard";
import Link from "next/link";

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
  slug: string;
  type?: "blog" | "news";
  categorySlug?: string;
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
  slug,
  type = "blog",
  categorySlug,
}: PostCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <Link href={slug}>
        <Image
          src={src}
          alt="Blog"
          width={1300}
          height={900}
          className="rounded-xl w-full object-cover aspect-video"
        />
      </Link>
      <div className="flex justify-between items-center">
        <Link href={`/${type}/${categorySlug}`}>
          <Badge className="bg-[#7fabd2] px-4 py-1.5 rounded-lg font-normal text-[12px]">
            {badge}
          </Badge>
        </Link>
        <p className="text-[14px]">{createAt}</p>
      </div>

      <Link href={slug}>
        <h3
          className={cn(
            "text-[20px] text-primary line-clamp-2 quicksand-medium"
          )}
        >
          {heading}
        </h3>
      </Link>
      <p className="mb-2 text-[16px] line-clamp-3">{description}</p>

      <AuthorViewSharePostCard
        name={name}
        share={slug}
        profilePic={profilePic}
        views={views}
        type={type}
      />
    </div>
  );
}

export default PostCard;
