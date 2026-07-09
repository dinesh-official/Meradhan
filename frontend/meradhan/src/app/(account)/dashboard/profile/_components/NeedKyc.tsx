import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { IoMdArrowDropright } from "react-icons/io";

function NeedKyc({
  title,
  desc,
  buttonText = "Complete Your KYC",
  href,
}: {
  title?: string;
  desc?: string;
  buttonText?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-3 py-10 w-full text-center">
      <Image
        alt="Need KYC"
        src="/static/sad-emoji.svg"
        width={500}
        height={300}
        className="mx-auto w-18 object-cover"
      />
      <p className="mb-3">{title}</p>
      <Link href={href || `/dashboard/kyc`}>
        <Button>
          {buttonText} <IoMdArrowDropright />
        </Button>
      </Link>
      <p>{desc}</p>
    </div>
  );
}

export default NeedKyc;
