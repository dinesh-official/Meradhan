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
const FeaturedBox = (featured: FeaturedBoxProps) => {;
  return (
    <section className="items-center gap-2 mb-10">
      <article className="w-full">
        <Link href={`/news/${featured.slug}`}>
          <Image
            src={featured.image}
            alt={featured.title}
            width={1140}
            height={597}
            className="rounded-2xl w-full object-cover aspect-[16/9]"
          />
        </Link>

        <div className="flex justify-between items-center mt-4">
          <span className="inline-block bg-[#7fabd2] px-3 py-1 rounded-md font-medium text-white text-xs">
            {featured.category}
          </span>
          <span className="text-gray-500 text-sm">{featured.date}</span>
        </div>

        <Link href={`/news/${featured.slug}`}>
          <h2 className="mt-3 font-semibold text-2xl hover:underline leading-snug">
            {featured.title}
          </h2>
        </Link>
        <p className="mt-1 text-gray-600">{featured.excerpt}</p>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 rounded-full w-8 h-8 overflow-hidden">
              <Image
                src={featured.author.avatar}
                alt={featured.author.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-sm">
              {featured.author.name}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1 text-sm">
              <Eye className="w-4 h-4" /> {featured.views}
            </span>
            <button
              aria-label="Share featured news"
              className="hover:"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default FeaturedBox;
