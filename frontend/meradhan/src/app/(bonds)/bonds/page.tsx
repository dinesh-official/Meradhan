import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import { LucideLayoutGrid } from "lucide-react";
import { FaList } from "react-icons/fa";
import ExploreBondsHeader from "./_components/ExploreBondsHeader";
import { BondListCard } from "@/global/components/Bond/BondListCard";

function page() {
  return (
    <ViewPort>
      <ExploreBondsHeader />
      <BondsByCategories />
      <div className="container">
        <div className="flex justify-between items-center">
          <h4 className={cn("text-2xl font-medium", quicksand.className)}>
            All <span className="font-semibold text-secondary">Bonds</span>
          </h4>
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list" className="text-md gap-2 px-3 py-3">
                <FaList /> List
              </TabsTrigger>
              <TabsTrigger value="grid" className="text-md gap-2 px-3 py-3">
                <LucideLayoutGrid /> Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm">
          Explore a comprehensive list of bonds available in MeraDhan’s
          database.
        </p>

        <div className="grid grid-cols-1 gap-5 py-5 mt-2">
          <BondListCard gridMode={false}></BondListCard>
          <BondListCard gridMode={false}></BondListCard>
          <BondListCard gridMode={false}></BondListCard>
          <BondListCard gridMode={false}></BondListCard>
          <BondListCard gridMode={false}></BondListCard>
          <BondListCard gridMode={false}></BondListCard>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
