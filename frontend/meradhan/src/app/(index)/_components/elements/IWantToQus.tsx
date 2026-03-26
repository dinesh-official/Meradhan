"use client";
import { MdArrowRight } from "react-icons/md";
import { MdArrowLeft } from "react-icons/md";
import React, { useState } from "react";

const questions = [
  {
    question: "I want to",
    options: ["Invest", "Learn", "Sell", "Contact Meradhan"],
  },
  {
    question: "I want to invest",
    options: ["< 50K", "50K - 2 Lac", "2 Lac - 5 Lac", "> 5 Lac"],
  },
  {
    question: "I am interested in",
    options: [
      "High Rated",
      "High Returns",
      "Regular Income",
      "One-time payout",
    ],
  },
  {
    question: "Investment tenure",
    options: ["< 2 years", "2 yrs - 5 yrs", "5 yrs - 10 yrs", "> 10 years"],
  },
];

function IWantToQus() {
  const [INDEX, setINDEX] = useState(0);
  const [answers, setAnswers] = useState(
    Array(questions.length).fill(undefined)
  );

  // ✅ Handle option click
  const handleOptionClick = (option: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[INDEX] = option;
    setAnswers(updatedAnswers);
  };

  // ✅ Move to next question (optional: auto next)
  const handleNext = () => {
    if (INDEX < questions.length - 1) setINDEX(INDEX + 1);
  };

  const handlePrev = () => {
    if (INDEX > 0) setINDEX(INDEX - 1);
  };

  return (
    <div className="text-white">
      <h3 className="font-medium text-xl">{questions[INDEX].question}</h3>

      <div className="gap-3 grid md:grid-cols-2 xl:grid-cols-4 mt-4">
        {questions[INDEX].options.map((option, index) => {
          const isSelected = answers[INDEX] === option;
          return (
            <div
              key={index + option}
              onClick={() => handleOptionClick(option)}
              className={`border-[1.5px] select-none cursor-pointer p-3 rounded-sm text-sm text-center transition-all duration-200
                ${
                  isSelected
                    ? "bg-secondary text-white border-secondary"
                    : "border-white/20 hover:border-gray-200/30"
                }`}
            >
              {option}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-3 font-medium">
        <div>
          {INDEX > 0 && (
            <button
              className="flex items-center gap-1 transition-colors cursor-pointer"
              onClick={handlePrev}
            >
              <MdArrowLeft size={24} className="text-secondary" /> Previous
            </button>
          )}
        </div>

        <div>
          {INDEX < questions.length - 1 ? (
            <button
              className="flex items-center gap-1 transition-colors cursor-pointer"
              onClick={handleNext}
            >
              Next <MdArrowRight size={24} className="text-secondary" />
            </button>
          ) : (
            <button
              className="flex items-center gap-1 text-white cursor-pointer"
              onClick={() => console.log("Submitted Answers:", answers)}
            >
              Submit <MdArrowRight size={24} className="text-secondary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IWantToQus;
