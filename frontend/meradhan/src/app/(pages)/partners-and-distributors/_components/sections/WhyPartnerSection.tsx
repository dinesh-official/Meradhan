import React from "react";

const WhyPartnerSection = () => {
  const benefits = [
    "Access to a comprehensive Indian bond marketplace",
    "Technology-driven platform with API integration options",
    "Transparent pricing and market insights",
    "Secure, compliant, and scalable infrastructure",
    "Dedicated onboarding and partner support",
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 quicksand-medium">
        Why Partner With MeraDhan
      </h2>
      <ul className="space-y-4">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-primary mt-1">✓</span>
            <span className="text-gray-700 leading-relaxed">{benefit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default WhyPartnerSection;

