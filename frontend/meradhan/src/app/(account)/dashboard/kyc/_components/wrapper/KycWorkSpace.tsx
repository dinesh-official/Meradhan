import { StepMenu } from "./elements/StepMenu";

function KycWorkSpace({ children }: { children?: React.ReactNode }) {
  return (
    <div className="lg:flex justify-start items-start gap-10">
      <div className="lg:min-w-72">
        <div className="flex justify-between items-center pb-5 border-gray-200 border-b lg:border-none">
          <h2 className="font-medium text-2xl">
            My <span className="font-semibold">KYC</span>
          </h2>
          <p className="lg:hidden">Step 2 of 5</p>
        </div>
        <StepMenu />
      </div>
      <div className="w-full">
        <p className="hidden lg:flex items-center gap-4 font-medium text-lg">
          Personal Details
          <span className="text-gray-600 text-xs">Step 2 of 6</span>
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default KycWorkSpace;
