"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssuerWatchList from "../WatchList/IssuerWatchList";
import BondsWatchList from "../WatchList/BondsWatchList";
import { useState } from "react";

function WatchList() {
  const [tab, setTab] = useState("bond");
  return (
    <div className="flex w-full flex-col  mt-5 ">
      <div className="w-full flex justify-end items-end">
        <Tabs className="hidden lg:flex float-end" value={tab}>
          <TabsList>
            <TabsTrigger
              value={"bond"}
              onClick={() => {
                setTab("bond");
              }}
              className="gap-2 px-3 py-3 text-md cursor-pointer"
            >
              Bonds
            </TabsTrigger>
            <TabsTrigger
              value="issuer"
              className="gap-2 px-3 py-3 text-md cursor-pointer"
              onClick={() => {
                setTab("issuer");
              }}
            >
              Issuer Notes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {tab == "bond" && <BondsWatchList />}
      {tab == "issuer" && <IssuerWatchList />}
    </div>
  );
}

export default WatchList;
