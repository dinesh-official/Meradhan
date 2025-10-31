import React from "react";

const FdHeader = () => {
  return (
    <div className="flex justify-center w-full">
      <div className="container">
        <div className="pb-16 space-y-4">
          <h1 className="text-[36px] quicksand-medium" >
            FD <span className="text-secondary ">Calculator</span>
          </h1>
          <p className="text-[24px]">
            Extended Internal Rate of Return Calculator
          </p>

          <p className="text-[16px] ">
            The XIRR Calculator helps you calculate the Extended Internal Rate
            of Return (XIRR) for your investments, especially when you make
            multiple investments at different intervals. It provides an accurate
            measure of your investment&apos;s performance over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FdHeader;
