import React from "react";

const FdHeader = () => {
  return (
    <div className="flex justify-center w-full">
      <div className="container">
        <div className=" py-12 px-5 space-y-6 ">
          <h1 className="text-[36px]">
            FD <span className="text-secondary">Calculator</span>
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
