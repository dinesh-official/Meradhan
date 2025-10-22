"use client";
import { Eye, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export type Author = {
  name: string;
  avatar: string;
};

type FeaturedBoxProps = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  views: number;
  author: Author;
};
const FeaturedBox = (featured: FeaturedBoxProps) => {
  console.log("featured", featured);
  return (
    <section className="mb-10 items-center gap-2">
      <article className="w-full">
        <Link href={`/news/${featured.slug}`}>
          <Image
            src={featured.image}
            alt={featured.title}
            width={1140}
            height={597}
            className="w-full aspect-[16/9] object-cover rounded-2xl"
          />
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-block text-xs font-medium bg-[#7fabd2] text-white px-3 py-1 rounded-md">
            {featured.category}
          </span>
          <span className="text-sm text-gray-500">{featured.date}</span>
        </div>

        <Link href={`/news/${featured.slug}`}>
          <h2 className="mt-3 text-2xl font-semibold leading-snug hover:underline">
            {featured.title}
          </h2>
        </Link>
        <p className="mt-1 text-gray-600">{featured.excerpt}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={featured.author.avatar}
                alt={featured.author.name}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>

            <span className="text-sm text-gray-700">
              {featured.author.name}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1 text-sm">
              <Eye className="h-4 w-4" /> {featured.views}
            </span>
            <button
              aria-label="Share featured news"
              className="hover:text-gray-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default FeaturedBox;
