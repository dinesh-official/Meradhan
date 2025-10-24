"use client";
import Link from "next/link";
import React, { JSX } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Carousel, { ArrowProps, ResponsiveType } from "react-multi-carousel";

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

// Custom Left Arrow
const CustomLeftArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10  p-2 cursor-pointer"
      aria-label="Previous Slide"
    >
      <FaChevronLeft size={18} className="text-gray-400" />
    </button>
  );
};

// Custom Right Arrow
const CustomRightArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-0 top-1/2 z-40 transform -translate-y-1/2   p-2 cursor-pointer "
      aria-label="Next Slide"
    >
      <FaChevronRight size={18} className="text-gray-400" />
    </button>
  );
};

const CategorySlider = ({category}:{ category: {
    icon: JSX.Element;
    name: string;
    href: string;
}[]
}) => {
  return (
    <div className="relative mt-8">
      <Carousel
        responsive={responsive}
        arrows={true}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        showDots={false}
        autoPlay
        infinite
      >
        {category.map((e, index) => (
          <Link
            href={e.href}
            key={index}
            className="flex justify-center items-center flex-col gap-3 select-none"
          >
            <div className="flex justify-center items-center bg-primary hover:bg-secondary transition-all cursor-pointer rounded-full w-14 h-14 text-white">
            {e.icon}
            </div>
            <p className="text-sm" >{e.name}</p>
          </Link>
        ))}
      </Carousel>
    </div>
  );
};

export default CategorySlider;
