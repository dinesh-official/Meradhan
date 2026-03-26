import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import TestimonialsSlide from "./elements/TestimonialsSlide";

function CustomersTestimonials() {
  return (
    <SectionWrapper>
      <div className="flex flex-col gap-5 container">
        <SectionTitleDesc
          title={
            <>
              <span className="font-semibold text-secondary">Customer`s</span>{" "}
              Testimonials
            </>
          }
          description="See what our users are saying—real stories from real investors who’ve
          found success with MeraDhan."
        />

        <TestimonialsSlide />
      </div>
    </SectionWrapper>
  );
}

export default CustomersTestimonials;
