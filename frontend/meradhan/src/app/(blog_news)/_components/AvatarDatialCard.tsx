import { HOST_URL } from "@/global/constants/domains";
import {
  SharePopupTrigger,
  SharePopupViewProvider,
} from "@/global/module/share/SharePopupView";
import Image from "next/image";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { IoShareSocialSharp } from "react-icons/io5";

interface AvatarDetailCardProps {
  name?: string;
  position?: string;
  image?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  share: string;
  type?: "blog" | "news";
}

function AvatarDetailCard({
  name = "Vikas Kukreja",
  position = "Marketing Head",
  image = "/avatars/person.jpeg",
  facebookUrl,
  twitterUrl,
  linkedinUrl,
  instagramUrl,
  share,
  type = "blog",
}: AvatarDetailCardProps) {
  return (
    <div className="flex flex-col gap-5">
      <p>Author:</p>
      <div className="flex items-start gap-3">
        <Image
          src={image}
          alt="Blog"
          width={100}
          height={100}
          className="w-12 h-12 rounded-full  object-cover"
        />
        <div className="w-full">
          <p className="text-gray-800 text-lg">{name}</p>
          <p className="text-gray-500 text-sm">{position}</p>
          <div className="flex gap-3 mt-3">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400 hover:bg-blue-600 transition">
                  <FaFacebookF size={14} />
                </div>
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400 hover:bg-black transition">
                  <FaXTwitter size={14} />
                </div>
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400 hover:bg-blue-700 transition">
                  <FaLinkedinIn size={14} />
                </div>
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400 hover:bg-pink-600 transition">
                  <FaInstagram size={14} />
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full border-t border-b py-3 border-gray-200 text-gray-600">
        <p>Share {type === "blog" ? "Article" : "News"}:</p>
        <SharePopupTrigger
          title={`Share ${type === "blog" ? "Blog" : "News"}`}
          url={`${HOST_URL}${share}`}
        >
          <IoShareSocialSharp className="cursor-pointer" />
        </SharePopupTrigger>
      </div>
    </div>
  );
}

export default AvatarDetailCard;
