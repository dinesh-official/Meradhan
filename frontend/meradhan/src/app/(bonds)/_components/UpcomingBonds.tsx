"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import { BondListCard } from "@/global/components/Bond/BondListCard";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 768, min: 0 },
    items: 1,
  },
};

function UpcomingBonds() {
  const apiGate = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  const { data } = useQuery({
    queryKey: ["upcoming-bonds"],
    queryFn: async () => {
      const { responseData } = await apiGate.getUpcomingBonds(6);
      return responseData;
    },
    staleTime: 1000 * 60 * 10,
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="container">
      <div className="pb-5">
        <div className="mt-20 mb-10">
          <SectionTitleDesc
            title={
              <>
                Upcoming{" "}
                <span className="font-semibold text-secondary">Bonds</span>
              </>
            }
            description="Discover upcoming bond issues before they open for investment."
          />
        </div>
        <Carousel
          responsive={responsive}
          autoPlay
          infinite
          partialVisible={false}
          autoPlaySpeed={3000}
          showDots={false}
          itemClass="px-4 pb-4"
        >
          {data.map((bond, i) => (
            <BondListCard
              gridMode
              data={bond}
              key={bond.isin}
              odd={i % 2 === 1}
            />
          ))}
        </Carousel>
      </div>
    </div>
  );
}

export default UpcomingBonds;
