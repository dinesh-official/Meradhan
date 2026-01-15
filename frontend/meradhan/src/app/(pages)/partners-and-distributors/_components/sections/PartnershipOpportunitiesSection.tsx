import React from "react";

const PartnershipOpportunitiesSection = () => {
  const opportunities = [
    {
      title: "Bond Distributors & Channel Partners",
      description:
        "Expand your product offerings with access to a comprehensive bond marketplace.",
    },
    {
      title: "Wealth Managers & Investment Advisors",
      description:
        "Provide your clients with transparent, efficient fixed-income investment solutions.",
    },
    {
      title: "Banks, NBFCs & Financial Institutions",
      description:
        "Integrate bond trading capabilities into your existing financial services platform.",
    },
    {
      title: "Fintech Platforms & Digital Investment Apps",
      description:
        "Enhance your platform with API integration options and white-label solutions.",
    },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 quicksand-medium">
        Partnership Opportunities
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {opportunities.map((opportunity, index) => (
          <div
            key={index}
            className="p-6 border border-gray-200 rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-2 quicksand-medium">
              {opportunity.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {opportunity.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnershipOpportunitiesSection;

