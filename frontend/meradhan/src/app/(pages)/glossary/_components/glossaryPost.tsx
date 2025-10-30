import React from "react";

interface GlossaryPostProps {
  heading: string;
  description: string;
}
const GlossaryPost = ({ heading, description }: GlossaryPostProps) => {
  return (
    <div className="flex flex-col gap-2 py-5 border-b border-gray-200">
      <h4 className="text-2xl">{heading}</h4>
      <p>{description}</p>
    </div>
  );
};

export default GlossaryPost;
