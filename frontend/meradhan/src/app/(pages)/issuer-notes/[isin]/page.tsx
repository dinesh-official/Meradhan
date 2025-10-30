import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { FaCalendarAlt, FaClock, FaEye, FaStar } from "react-icons/fa";
import { RiShareFill } from "react-icons/ri";
import IsshuerNotesAddToWatchList from "../_components/IsshuerNotesAddToWatchList";
import { cn } from "@/lib/utils";
import { quicksand } from "@/global/font/font";
import Image from "next/image";
import { SortInfoBox } from "@/global/components/wrapper/cards/SortInfoBox";

function page() {
  return (
    <ViewPort>
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Issuer Notes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                ICICI HOME FINANCE COMPANY LIMITED
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="py-14">
          <div className="flex flex-col gap-5">
            {/* date actions  */}
            <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-5">
              <div className="flex justify-between lg:justify-start items-center gap-8 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-gray-500">
                  <div>
                    <FaCalendarAlt size={18} />
                  </div>
                  <p>13 Jun 2025</p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaClock size={18} /> <p>5 min read</p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaEye size={18} /> <p>9</p>
                </div>
              </div>
              <div className="flex justify-between lg:justify-end items-center gap-5 w-full lg:w-auto">
                <IsshuerNotesAddToWatchList />
                <div className="flex items-center gap-2 bg-secondary p-1 rounded-md text-white cursor-pointer">
                  <RiShareFill size={16} />
                </div>
              </div>
            </div>
            {/* title logo  */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex flex-col gap-5">
                <h1 className={cn("font-medium text-4xl", quicksand.className)}>
                  ICICI HOME FINANCE COMPANY LIMITED
                </h1>

                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3 bg-green-600 px-5 py-2 rounded-lg text-white">
                    <FaStar /> <p>AAA</p>
                  </div>
                  <p className="text-gray-600">ICRA LIMITED</p>
                </div>
              </div>
              <div>
                <Image
                  src="/avatars/sebi_logo_18a35a5d3f.png"
                  width={200}
                  height={200}
                  alt="No found"
                  className="p-3 border border- border-gray-200 rounded-lg w-28 h-auto object-contain aspect-square"
                />
              </div>
            </div>
            {/* // cards  */}
            <div className="gap-5 grid md:grid-cols-4">
              <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
              <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
              <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
              <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            </div>
          </div>

          {/* // content  */}
          <div className="flex flex-col gap-5 mt-10">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A sunt
              magnam tempore delectus quo reiciendis placeat dolore aliquam
              suscipit pariatur, fuga voluptas porro dignissimos? Iste veritatis
              modi sed cumque tempora.
            </p>
            <div>
              {/* // cards  */}
              <p className="mb-3 font-medium text-xl">Instrument Details</p>
              <div className="gap-5 grid md:grid-cols-4">
                <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
                <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
                <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
                <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
