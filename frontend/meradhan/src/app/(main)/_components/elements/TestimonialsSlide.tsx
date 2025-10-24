"use client";
import StarRating from "@/global/elements/StarRating";
import Image from "next/image";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Carousel, { ArrowProps, ResponsiveType } from "react-multi-carousel";
const responsive: ResponsiveType = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 2,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
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

const TestimonialsSlide = () => {
  return (
    <div className="relative mt-8">
      <Carousel
        responsive={responsive}
        arrows={true}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        showDots={false}
        autoPlay
        partialVisible={false}
      >
        <Testimonial />
        <Testimonial />
        <Testimonial />
        <Testimonial />
      </Carousel>
    </div>
  );
};

export default TestimonialsSlide;

function Testimonial() {
  return (
    <div className="flex md:flex-row flex-col   gap-5 items-center px-10">
      <div className="relative min-w-52">
        <div className="w-24 h-56 rounded-xl bg-muted"></div>
        <Image
          src={"/avatars/person.jpeg"}
          alt="person"
          width={300}
          height={300}
          className="w-44 h-44 mt-6 ml-5 object-cover rounded-xl absolute top-0 left-0 bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-md">
          MeraDhan’s AI-powered bond search is incredibly accurate. It saved me
          so much time in finding the right bonds based on my investment goals.
          I feel more in control of my financial future.
        </p>
        <div className="flex items-center gap-5">
          <p className="font-semibold text-gray-600">Deepak Joshi, Jaipur </p>
          <StarRating value={5} size={16} />
        </div>
      </div>
    </div>
  );
}
