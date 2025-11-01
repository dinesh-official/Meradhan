"use client";
import StarRating from "@/global/elements/StarRating";
import { cn } from "@/lib/utils";
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

// Custom Right Arrow
export const CustomArrow: React.FC<ArrowProps & { side: "LEFT" | "RIGHT" }> = ({
  onClick,
  side,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "top-1/2 z-40 absolute py-2 -translate-y-1/2 cursor-pointer transform",
        side == "LEFT" ? "left-0" : "right-0 "
      )}
      aria-label="Next Slide"
    >
      {side == "LEFT" ? (
        <FaChevronLeft size={18} className="text-gray-400" />
      ) : (
        <FaChevronRight size={18} className="text-gray-400" />
      )}
    </button>
  );
};

const TestimonialsSlide = () => {
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
    <div className="flex md:flex-row flex-col items-center gap-5 px-10">
      <div className="relative min-w-52">
        <div className="bg-muted rounded-xl w-24 h-56"></div>
        <Image
          src={"/avatars/person.jpeg"}
          alt="person"
          width={300}
          height={300}
          className="top-0 left-0 absolute bg-gray-50 mt-6 ml-5 rounded-xl w-44 h-44 object-cover"
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
