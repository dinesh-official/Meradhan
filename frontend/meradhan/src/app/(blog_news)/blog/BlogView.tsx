import React from "react";
import BlogPageFIlterOrSort from "./_components/BlogPageFIlterOrSort";
import { cn } from "@/lib/utils";
import { quicksand } from "@/global/font/font";
import PostCard from "../_components/PostCard";

function BlogView() {
  return (
    <div>
      <div className="pt-10">
        <h1 className={cn("text-4xl font-medium", quicksand.className)}>
          MeraDhan <span className="text-secondary font-semibold">Blogs</span>
        </h1>
        <BlogPageFIlterOrSort />
      </div>

     <div className="flex flex-col gap-5 gap-y-8">
        <PostCard
            listMode
            src="/assets/bondYield.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="What Are Bonds? A Simple Guide for Indian Investors"
            description="Bonds are one of the most trusted and popular investment instruments, especially among investors seeking safety, stability, and a predictable income stream. Despite their popularity, many Indian investors often find themselves puzzled by how bonds work and how they fit into their financial plans. updated"
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="10"
          />
        <div className="grid md:grid-cols-3 gap-5 gap-y-5">
          <PostCard
            listMode
            src="/assets/whatAreBonds.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="What Is Credit Rating in Bonds?"
            description="When you’re investing in bonds, one of the first things you might come across is a credit rating. This rating acts like a report card for the bond..."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="21"
          />

          <PostCard
            listMode
            src="/assets/bondYield.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="What Is Yield in Bonds and How Is It Calculated?"
            description="When you begin exploring bond investments, one term you’ll frequently encounter is “yield.” Understanding what it means and how to calculate it helps you compare options..."
            name="Vikas Kukreja"
            profilePic="/avatars/person.jpeg"
            views="10"
          />

          <PostCard
            listMode
            src="/assets/bondMaturity.png"
            badge="Educative"
            createAt="24 Oct 2025"
            heading="What Is a Bond Maturity and Why It Matters"
            description="When investing in bonds, one of the most important terms you’ll come across is “maturity.” It may sound technical, but understanding it helps you plan your cashflows..."
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
            description="Bonds have emerged as one of the most reliable and popular investment options in India. From government securities to corporate bonds and tax-free options..."
            name="Sourav Bapari"
            profilePic="/avatars/person.jpeg"
            views="12"
          />
        </div>
      </div>
    </div>
  );
}

export default BlogView;
