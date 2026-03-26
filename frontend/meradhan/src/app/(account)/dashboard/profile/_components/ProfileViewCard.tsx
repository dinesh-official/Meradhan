import { Button } from "@/components/ui/button";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { makeFullname } from "@/global/utils/formate";
import { genMediaUrl } from "@/global/utils/url.utils";
import { cn } from "@/lib/utils";
import { GetCustomerResponseById } from "@root/apiGateway";
import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BiSolidFileFind } from "react-icons/bi";
import { FaCheckSquare } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { RiArrowRightSFill } from "react-icons/ri";
function ProfileViewCard({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  return (
    <div>
      <div className="flex md:flex-row flex-col md:justify-between items-center gap-5">
        <div className="flex md:flex-row flex-col items-center gap-5 md:text-left text-center">
          <div className="p-0.5 border border-primary border-dashed rounded-full w-24 h-24 overflow-hidden">
            <div className="rounded-full overflow-hidden">
              <Image
                alt="logo"
                src={genMediaUrl(profile.avatar)}
                width={100}
                height={100}
                className="border border-primary rounded-full w-full h-full object-cover aspect-square scale-125"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 md:text-left text-center">
            <p className="flex justify-center md:justify-start items-center gap-3 font-semibold text-lg uppercase">
              {makeFullname({
                firstName: profile.firstName,
                middleName: profile.middleName,
                lastName: profile.lastName,
              })}
              {(profile.kycStatus == "VERIFIED" ||
                profile.kycStatus == "RE_KYC") && (
                  <FaCheckSquare className="text-green-600" />
                )}
            </p>
            <p>Client ID: {profile.userName}</p>
            <p>User Type: {profile.userType}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-col justify-between md:justify-end md:items-end gap-3 lg:gap-5 pt-6 md:pt-0 border-gray-200 border-t md:border-none w-full md:w-auto">
          {/* Column 1: status + date; on mobile RE_KYC: [text | Update KYC] then date */}
          <div className="flex flex-col md:justify-end md:items-end gap-3 w-full md:w-auto">
            {profile.kycStatus == "RE_KYC" ? (
              <>
                {/* Mobile: one row [KYC text ----- Update KYC]. Desktop: column, text then button */}
                <div className="flex flex-row justify-between items-center gap-2 md:flex-col md:items-end md:justify-start w-full md:w-auto">
                  <p
                    className={cn(
                      "flex items-center gap-2 font-medium md:text-lg text-orange-600 shrink-0"
                    )}
                  >
                    KYC:{" "}
                    <span className="hidden sm:inline-block">Update Details</span>
                    <span className="sm:hidden">Update Details</span>
                    <IoWarning size={18} />
                  </p>
                  <Link href={`/dashboard/kyc`} className="shrink-0 md:block">
                    <Button variant={`secondary`}>
                      Update KYC
                      <div className="w-3 text-3xl">
                        <RiArrowRightSFill className="w-4 h-5" size={33} />
                      </div>
                    </Button>
                  </Link>
                </div>
                {profile.verifyDate && (
                  <p className="text-[#666666] text-xs">
                    Last KYC Verified On:{" "}
                      {dateTimeUtils.formatDateTime(
                        profile.verifyDate,
                        "DD MMM YYYY"
                      ) +
                        " | " +
                        dateTimeUtils.formatDateTime(
                          profile.verifyDate,
                          "hh:mm aa"
                        )}
                  </p>
                )}
              </>
            ) : (
              <>
                <p
                  className={cn(
                    "flex items-center gap-2 font-medium md:text-lg",
                    profile.kycStatus == "VERIFIED"
                      ? "text-black"
                      : profile.kycStatus == "UNDER_REVIEW"
                        ? "text-yellow-600"
                        : "text-red-600"
                  )}
                >
                  {profile.kycStatus == "VERIFIED" ? (
                    <>
                      KYC:{" "}
                      <span className="hidden sm:inline-block">Completed</span>
                      <span className="sm:hidden">Done</span>{" "}
                      <FaCheckSquare className="text-green-600" />
                    </>
                  ) : profile.kycStatus == "UNDER_REVIEW" ? (
                    <>
                      <span className="text-black">KYC:</span>{" "}
                      <span className="hidden sm:inline-block">
                        Under Review
                      </span>
                      <span className="sm:hidden">Under Review</span>{" "}
                      <BiSolidFileFind size={20} className="text-yellow-600" />
                    </>
                  ) : (
                    <>
                      KYC: Not{" "}
                      <span className="hidden sm:inline-block">Completed</span>
                      <span className="sm:hidden">Done</span>
                      <IoWarning size={18} />
                    </>
                  )}
                </p>
                {profile.kycStatus == "VERIFIED" && profile.verifyDate && (
                  <p className="text-[#666666] text-xs">
                    {dateTimeUtils.formatDateTime(
                      profile.verifyDate,
                      "DD MMM YYYY"
                    ) +
                      " | " +
                      dateTimeUtils.formatDateTime(
                        profile.verifyDate,
                        "hh:mm aa"
                      )}
                  </p>
                )}
                {profile.kycStatus == "UNDER_REVIEW" && profile?.kycSubmitDate && (
                  <p className="text-[#666666] text-xs">
                    {dateTimeUtils.formatDateTime(
                      profile?.kycSubmitDate,
                      "DD MMM YYYY"
                    ) +
                      " | " +
                      dateTimeUtils.formatDateTime(
                        profile?.kycSubmitDate,
                        "hh:mm aa"
                      )}
                  </p>
                )}
                {profile.kraStatus && (
                  <p className="text-[#666666] text-xs font-medium">
                    KRA: {String(profile.kraStatus).replace(/_/g, " ")}
                  </p>
                )}
              </>
            )}
          </div>

          {/* KYC Copy / Download PDF: show when verified, rekyc, or in review (if PDF available) */}
          {(profile.kycStatus == "VERIFIED" ||
            (profile.kycStatus == "RE_KYC" &&
              profile.personalInformation?.signPdfUrl) ||
            (profile.kycStatus == "UNDER_REVIEW" &&
              profile.personalInformation?.signPdfUrl)) && (
            <Link
              href={genMediaUrl(profile.personalInformation?.signPdfUrl || "#")}
              target="_blank"
            >
              <Button variant={`defaultLight`}>
                KYC Copy
                <div className="w-3 text-3xl">
                  <Download className="w-4 h-5" size={33} />
                </div>
              </Button>
            </Link>
          )}
          {profile.kycStatus == "PENDING" && (
            <Link href={`/dashboard/kyc`} className="block w-full md:w-auto [&>button]:w-full md:[&>button]:w-auto">
              <Button variant={`secondary`}>
                Complete <span className="hidden md:inline-block">Your</span>{" "}
                KYC
                <div className="w-3 text-3xl">
                  <RiArrowRightSFill className="w-4 h-5" size={33} />
                </div>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-row justify-between items-center gap-1 mt-4 text-[#666666] text-xs">
        <p>
          Joined on: <br className="md:hidden" />
          {dateTimeUtils.formatDateTime(profile.createdAt, "DD MMM YYYY")}
        </p>
        <p className="text-right">
          Last Login: <br className="md:hidden" />
          {profile.utility.lastLogin
            ? dateTimeUtils.formatDateTime(
              profile.utility.lastLogin,
              "DD MMM YYYY"
            ) + " | " +
            dateTimeUtils.formatDateTime(
              profile.utility.lastLogin,
              "hh:mm aa"
            )
            : "No data available"}
        </p>
      </div>
    </div>
  );
}

export default ProfileViewCard;
