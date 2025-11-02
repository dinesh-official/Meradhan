"use client";
import { CustomArrow } from "@/app/(index)/_components/elements/TestimonialsSlide";
import Image from "next/image";
import Link from "next/link";
import Carousel, { ResponsiveType } from "react-multi-carousel";

const responsive: ResponsiveType = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 6,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 6,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2,
  },
};

const CategorySlider = ({
  category,
}: {
  category: {
    imageUrl: string;
    categoryName: string;
    href: string;
  }[];
}) => {
  return (
    <div className="relative mt-8">
      <Carousel
        responsive={responsive}
        arrows={true}
        customLeftArrow={<CustomArrow side="LEFT" />}
        customRightArrow={<CustomArrow side="RIGHT" />}
        showDots={false}
        autoPlay
        infinite
      >
        {category.map((e, index) => (
          <Link
            href={e.href}
            key={index}
            className="flex flex-col justify-center items-center gap-3 select-none"
          >
            <div className="flex justify-center items-center bg-primary hover:bg-secondary rounded-full w-14 h-14 text-white transition-all cursor-pointer">
              <Image
                src={e.imageUrl}
                width={18}
                height={18}
                className=""
                alt=""
              />
            </div>
            <p className="text-sm">{e.categoryName}</p>
          </Link>
        ))}
      </Carousel>
    </div>
  );
};

export default CategorySlider;
