"use client";
import Carousel from "react-multi-carousel";
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 2,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

function ImageSlider({ imaeges }: { imaeges?: string[] }) {
  return (
    <Carousel responsive={responsive}>
      {imaeges?.map((imgUrl, index) => (
        <div key={index} className="p-1">
          <img src={imgUrl} alt={`Image ${index + 1}`} />
        </div>
      ))}
    </Carousel>
  );
}

export default ImageSlider;
