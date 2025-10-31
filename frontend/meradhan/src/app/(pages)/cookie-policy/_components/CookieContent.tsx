import React from "react";

const CookieContent = () => {
  return (
    <section className="flex justify-center w-full">
      <div className="container">
        <div className="py-12 px-5 leading-relaxed space-y-6 text-[14px]">
          <p>
            Welcome to <strong>MeraDhan</strong>, a platform by BondNest Capital
            India Securities Private Limited.
          </p>

          <h3 className="text-xl text-gray-900 mt-4">What Are Cookies?</h3>
          <p>
            Cookies are small text files stored on your computer or mobile when
            you visit a website. Only the website that stored the cookie can
            read it. Cookies help websites remember things about your visit,
            like your preferences or the pages you visited. They can also show
            you relevant ads and limit the number of times you see them.
          </p>

          <h3 className="text-xl text-gray-900 mt-4">
            How MeraDhan Uses Cookies
          </h3>
          <p>
            We use cookies to improve your experience on our website. Cookies
            help us understand which pages you visit, how much time you spend on
            our website, and how you use our services. This helps us make our
            website better for you.
          </p>

          <p>
            We do not collect personal details like your name or address through
            cookies. The information from cookies is only used to improve your
            experience and is not shared with anyone else.
          </p>

          <h3 className="text-xl  text-gray-900 mt-4">
            What Information Do Cookies Collect?
          </h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              How you reached our website (for example, from Google or an ad)
            </li>
            <li>How much time you spend on our website</li>
            <li>Which pages you visit</li>
            <li>Ads you click on</li>
          </ul>

          <h3 className="text-xl text-gray-900 mt-4">How to Manage Cookies</h3>
          <p>
            Most internet browsers accept cookies automatically. However, you
            can change your browser settings to block cookies if you want. You
            can also allow cookies only from trusted websites.
          </p>
          <p>
            To learn more about cookies and how to control them, visit{" "}
            <a
              href="https://www.aboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              www.aboutcookies.org
            </a>
            .
          </p>

          <h3 className="text-xl  text-gray-900 mt-4">
            Changes to This Policy
          </h3>
          <p>
            We may update this cookie policy from time to time. We will try to
            inform you about major changes, but we suggest checking this page
            regularly to stay updated.
          </p>

          <p>If you have any questions, feel free to contact us.</p>
        </div>
      </div>
    </section>
  );
};

export default CookieContent;
