import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IoWarning } from "react-icons/io5";
import { RiArrowRightSFill } from "react-icons/ri";
function ProfileViewCard() {
  return (
    <div>
      <div className="flex md:flex-row flex-col md:justify-between items-center gap-5">
        <div className="flex md:flex-row flex-col items-center gap-5 md:text-left text-center md:">
          <Image
            alt="logo"
            src={`/avatars/person.jpeg`}
            width={100}
            height={100}
            className="p-[2px] border-2 border-primary border-dashed rounded-full w-24 h-24 object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-lg">Sourav Sourav</p>
            <p>Client ID: MD119</p>
            <p>User Type: Individual </p>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col justify-between md:justify-end items-center gap-3 lg:gap-5 w-full md:w-auto text-center">
          <p className="flex items-center gap-2 font-medium text-secondary text-lg">
            KYC: Not Done <IoWarning />
          </p>
          <Button variant={`secondary`}>
            Compleat Your KYC
            <div className="w-3 text-3xl">
              <RiArrowRightSFill className="w-4 h-5" size={33} />
            </div>
          </Button>
        </div>
      </div>

      <div className="flex sm:flex-row flex-col sm:justify-between items-center gap-1 mt-4 mb-5 lg:mb-2 text-gray-600 text-xs">
        <p>Joined on: 21 Aug 2025 | 08:02 pm</p>
        <p>Last Login: No data available</p>
      </div>
    </div>
  );
}

export default ProfileViewCard;
