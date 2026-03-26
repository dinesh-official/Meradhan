"use client";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { makeFullname } from "@/global/utils/formate";
import React from "react";

function NameTitleView() {
  const { session } = userSessionStore();

  return (
    <>
      Welcome{" "}
      <span className="font-bold">
        {makeFullname({
          firstName: session?.firstName || "User",
          middleName: session?.middleName,
          lastName: session?.lastName,
        })}
      </span>
      {session && "!"}
    </>
  );
}

export default NameTitleView;
