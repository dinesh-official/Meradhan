import React from "react";

const RiskProfilingQuestions = [
  {
    question: "How many years of investment experience do you have?",
    options: ["None", "Upto 1 Year", "1 - 5 Years", "Above 5 Years"],
  },
  {
    question: "How many years of investment experience do you have?",
    options: ["None", "Upto 1 Year", "1 - 5 Years", "Above 5 Years"],
  },
  {
    question: "How many years of investment experience do you have?",
    options: ["None", "Upto 1 Year", "1 - 5 Years", "Above 5 Years"],
  },
  {
    question: "How many years of investment experience do you have?",
    options: ["None", "Upto 1 Year", "1 - 5 Years", "Above 5 Years"],
  },
];

function RiskProfilingSelector() {
  return <div className="flex flex-col gap-5" >
    {
      RiskProfilingQuestions.map((question, idx) => (
        <div key={idx} className="flex flex-col gap-2" >
          <p className="font-medium text-sm"  >{question.question}</p>
          <div className="gap-5 grid lg:grid-cols-4" >
            {
              question.options.map((option, idx) => (
                <div key={idx} className="p-2.5 border border-gray-200 rounded-lg text-center" >
                  <p>{option}</p>
                </div>
              ))
            }
        </div>
        </div>
      ))
    }
  </div>;
}

export default RiskProfilingSelector;
