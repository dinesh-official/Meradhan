import {
    FaFileSignature,
    FaFingerprint,
    FaUniversity,
    FaUser
} from "react-icons/fa";
import { HiIdentification } from "react-icons/hi2";
import { MdOutlineAssessment } from "react-icons/md";
import { KycSteListItem } from "./KycSteListItem";


export function StepMenu() {
  return (
    <div className="pb-4 overflow-hidden overflow-x-auto scrollbar-hide">
      <div className="border-gray-200 border-b lg:border-b-0 min-w-[580px] lg:min-w-auto">
        <div className="flex flex-row lg:flex-col gap-5 lg:gap-0">
          <KycSteListItem
            icon={<FaFingerprint />}
            label="Identity Validation"
            isActive
            isDone
          />
          <KycSteListItem icon={<FaUser />} isActive label="Personal Details" />
          <KycSteListItem icon={<FaUniversity />} label="Bank Account" />
          <KycSteListItem icon={<HiIdentification />} label="Demat Account" />
          <KycSteListItem
            icon={<MdOutlineAssessment />}
            label="Risk Profiling"
          />
          <KycSteListItem icon={<FaFileSignature />} label="e-Signature" />
        </div>
      </div>
    </div>
  );
}