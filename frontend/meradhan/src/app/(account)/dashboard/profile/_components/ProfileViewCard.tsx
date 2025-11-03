import { Button } from "@/components/ui/button";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { makeFullname } from "@/global/utils/formate";
import { genMediaUrl } from "@/global/utils/url.utils";
import { GetCustomerResponseById } from "@root/apiGateway";
import Image from "next/image";
import Link from "next/link";
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
        <div className="flex md:flex-row flex-col items-center gap-5 md:text-left text-center md:">
          <Image
            alt="logo"
            src={genMediaUrl(profile.avatar)}
            width={100}
            height={100}
            className="p-0.5 border border-primary border-dashed rounded-full w-24 h-24 object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-lg">
              {makeFullname({
                firstName: profile.firstName,
                middleName: profile.middleName,
                lastName: profile.lastName,
              })}
            </p>
            <p>Client ID: {profile.userName}</p>
            <p>User Type: {profile.userType}</p>
          </div>
        </div>

        <div className="flex sm:flex-row justify-between md:justify-end items-center gap-3 lg:gap-5 w-full md:w-auto text-center">
          <p className="flex items-center gap-2 font-medium text-secondary text-lg">
            KYC: Not Done <IoWarning />
          </p>
          <Link href={`/dashboard/kyc`}>
            <Button variant={`secondary`}>
              Complete Your KYC
              <div className="w-3 text-3xl">
                <RiArrowRightSFill className="w-4 h-5" size={33} />
              </div>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex sm:flex-row flex-col sm:justify-between items-center gap-1 mt-4 text-gray-600 text-xs">
        <p>
          Joined on:{" "}
          {dateTimeUtils.formatDateTime(profile.createdAt, "DD MMM YYYY")}
        </p>
        <p>
          Last Login:{" "}
          {profile.utility.lastLogin
            ? dateTimeUtils.formatDateTime(
                profile.utility.lastLogin,
                "DD MMM YYYY"
              ) +
              " | " +
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
