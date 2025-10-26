import React from "react";
import { cn } from "@/lib/utils";
import { quicksand } from "@/global/font/font";
import PostCard from "../_components/PostCard";
import NewsPageFIlterOrSort from "./_components/NewsPageFIlterOrSort";

function NewsView() {
  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl font-medium", quicksand.className)}>
          MeraDhan <span className="text-secondary font-semibold">News</span>
        </h1>
        <NewsPageFIlterOrSort />
      </div>

      <div className="flex flex-col gap-5 gap-y-8">
        <PostCard
          listMode
          src="/assets/typesOfBonds.png"
          badge="Educative"
          createAt="24 Oct 2025"
          heading="What Is Credit Rating in Bonds?"
          description="When you’re investing in bonds, one of the first things you might come across is a credit rating. This rating acts like a report card for the bond. It tells you how likely it is that the issuer will repay your investment on time."
          name="Vikas Kukreja"
          profilePic="/avatars/person.jpeg"
          views="21"
        />
        <div className="grid md:grid-cols-3 gap-5 gap-y-8">
          <PostCard
            listMode
            src="/assets/typesOfBonds.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="What Is Yield in Bonds and How Is It Calculated?"
            description="When you begin exploring bond investments, one term you’ll frequently encounter is “yield.” Understanding what it means and how to calculate it helps you compare options effectively."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="10"
          />

          <PostCard
            listMode
            src="/assets/typesOfBonds.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="What Is a Bond Maturity and Why It Matters"
            description="When investing in bonds, one of the most important terms you’ll come across is “maturity.” It may sound technical, but understanding it helps you plan your cashflows."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="7"
          />

          <PostCard
            listMode
            src="/assets/typesOfBonds.png"
            badge="Test"
            createAt="24 Oct 2025"
            heading="Types of Bonds in India You Should Know"
            description="Bonds have emerged as one of the most reliable and popular investment options in India. Offering stability, predictable returns, and diversification benefits."
            name="Sourav Bapari"
            profilePic="/avatars/person.jpeg"
            views="12"
          />

          <PostCard
            listMode
            src="/assets/typesOfBonds.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="How Credit Ratings Impact Bond Risk"
            description="Credit ratings help investors judge how likely issuers are to meet their obligations. Here’s how ratings translate to risk and returns for your bond portfolio."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="9"
          />

          <PostCard
            listMode
            src="/assets/typesOfBonds.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="Yield vs Coupon: What’s the Difference?"
            description="Coupon is what a bond pays; yield is what you actually earn. This post breaks down the difference with simple examples for better clarity."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="8"
          />

          <PostCard
            listMode
            src="/assets/typesOfBonds.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="Why Bond Maturity Affects Interest Rate Risk"
            description="Longer maturities tend to fluctuate more with changes in interest rates. Learn why and how to manage this risk in your bond investments."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="6"
          />
        </div>
      </div>
    </div>
  );
}

export default NewsView;
