"use client";
import { userSessionStore } from "@/core/auth/userSessionStore";
import React from "react";

function NameTitleView() {
  const { session } = userSessionStore();

  return (
    <>
      Welcome{" "}
      <span className="font-bold">
        {session?.firstName} {session?.lastName}
      </span>
      {session && "!"}
    </>
  );
}

export default NameTitleView;
