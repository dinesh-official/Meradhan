 import { cn } from "@/lib/utils";
import TestimonialsSlide from "./elements/TestimonialsSlide";

function CustomersTestimonials() {
  return (
    <div className="bg-white py-14 ">
      <div className="container flex flex-col gap-5">
        <h3
          className={cn(
            "text-center lg:text-3xl  text-2xl  font-medium",
            "quicksand-medium"
          )}
        >
          <span className="text-secondary font-semibold">Customer`s</span>{" "}
          Testimonials
        </h3>
        <p className="text-center">
          See what our users are saying—real stories from real investors who’ve
          found success with MeraDhan.
        </p>

        <div>
          <TestimonialsSlide />
        </div>
      </div>
    </div>
  );
}

export default CustomersTestimonials;
