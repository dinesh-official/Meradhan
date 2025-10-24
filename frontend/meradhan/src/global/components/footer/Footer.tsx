import React from "react";
import { FaInstagramSquare } from "react-icons/fa";
import {
  FaFacebook,
  FaLinkedin,
  FaLocationDot,
  FaPinterest,
  FaXTwitter,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

function Footer() {
  return (
    <div>
      <div className="bg-[#f5f5f5] py-12">
        <div className="container">
          <p className="text-sm text-center lg:px-28">
            Disclaimer : The content on this website is for informational and
            educational purposes only. MeraDhan does not provide investment,
            legal, or tax advice. Please consult a registered financial advisor
            before making any investment decisions.
          </p>

          <div className="grid lg:grid-cols-2 mt-14">
            <div className="flex flex-col gap-6">
              <h5 className="text-xl">MeraDhan</h5>
              <ul className="flex text-xl gap-4 text-primary">
                <li>
                  <FaFacebook />
                </li>
                <li>
                  <FaInstagramSquare />
                </li>
                <li>
                  <FaPinterest />
                </li>
                <li>
                  <FaLinkedin />
                </li>
                <li>
                  <FaXTwitter />
                </li>
              </ul>
              <div className="flex flex-col gap-3">
                <div className="text-sm flex  gap-4">
                  <div className="w-4 mt-1">
                    <FaLocationDot size={16} />
                  </div>
                  <p>
                    D 2703, Ashok Tower, Dr SSR Road, Parel (East) <br /> Mumbai
                    - 400012, Maharashtra
                  </p>
                </div>
                <div className="text-sm flx  items-center flex gap-4">
                  <div className="w-4">
                    <MdEmail size={16} />
                  </div>
                  <p>contact@meradhan.co</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5 mt-5">
              <div>
                <h6 className="font-base text-lg">Explore</h6>
                <ul className="text-sm flex flex-col gap-3 mt-3">
                  <li>Bond Directory</li>
                </ul>
              </div>
              <div>
                <h6 className="font-base text-lg">Company</h6>
                <ul className="text-sm flex flex-col gap-3 mt-3">
                  <li>About Us</li>
                  <li>Disclaimer</li>
                  <li>Contact Us</li>
                </ul>
              </div>
              <div>
                <h6 className="font-base text-lg">Resources</h6>
                <ul className="text-sm flex flex-col gap-3  mt-3">
                  <li>Blog</li>
                  <li>News</li>
                  <li>Economic Calendar</li>
                  <li>Glossary</li>
                  <li>FAQs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="py-6 text-sm flex md:justify-between justify-center gap-2 md:items-center items-center md:flex-row flex-col ">
          <p>© 2025 MeraDhan. All Rights Reserved</p>
          <div className="flex  items-center gap-4">
            <p>Privacy Policy</p>
            <p>Terms of Use</p>
            <p>Cookie Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
