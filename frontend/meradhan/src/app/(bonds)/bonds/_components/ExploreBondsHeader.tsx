import { Input } from "@/components/ui/input";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
function ExploreBondsHeader() {
  return (
    <div className="w-full lg:h-[420px] py-8 bg-primary flx flex-col justify-center items-center">
      <div className="container text-center text-white h-full">
        <div className="flex flex-col gap-5 h-full justify-center">
          <h1
            className={cn(
              "lg:text-[40px] text-3xl font-medium",
              quicksand.className
            )}
          >
            Exclusive{" "}
            <span className="text-secondary font-semibold">
              Bonds Directory
            </span>
          </h1>
          <p>Get access to 26000+ bonds of India</p>
          <div className="relative ">
            <Input
              className=" bg-white border-0 text-gray-950 py-5.5 px-5"
              placeholder="Search by ISIN, Issuer Name"
              type="email"
            />
            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Subscribe"
            >
              <Search className="text-secondary mr-3" />
            </button>
          </div>
          <p className="mt-5">Or Search by Filter</p>
          <div className="grid lg:grid-cols-6 grid-cols-2 gap-3">
            <MultiSelect defaultValues={["sveltwekit"]}>
              <MultiSelectTrigger className="w-full  ">
                <MultiSelectValue placeholder="Yield" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  <MultiSelectItem value="next.js">0-2 years</MultiSelectItem>
                  <MultiSelectItem value="sveltekit">2-5 years</MultiSelectItem>
                  <MultiSelectItem value="sveltwekit">
                    5-10 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekeit">
                    10-20 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekwwweit">
                    20+ years
                  </MultiSelectItem>
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
            <MultiSelect>
              <MultiSelectTrigger className="w-full ">
                <MultiSelectValue placeholder="Select Maturity" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  <MultiSelectItem value="next.js">0-2 years</MultiSelectItem>
                  <MultiSelectItem value="sveltekit">2-5 years</MultiSelectItem>
                  <MultiSelectItem value="sveltwekit">
                    5-10 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekeit">
                    10-20 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekwwweit">
                    20+ years
                  </MultiSelectItem>
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
            <MultiSelect>
              <MultiSelectTrigger className="w-full ">
                <MultiSelectValue placeholder="Credit Rating" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  <MultiSelectItem value="next.js">0-2 years</MultiSelectItem>
                  <MultiSelectItem value="sveltekit">2-5 years</MultiSelectItem>
                  <MultiSelectItem value="sveltwekit">
                    5-10 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekeit">
                    10-20 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekwwweit">
                    20+ years
                  </MultiSelectItem>
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
            <MultiSelect>
              <MultiSelectTrigger className="w-full ">
                <MultiSelectValue placeholder="Taxation" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  <MultiSelectItem value="next.js">0-2 years</MultiSelectItem>
                  <MultiSelectItem value="sveltekit">2-5 years</MultiSelectItem>
                  <MultiSelectItem value="sveltwekit">
                    5-10 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekeit">
                    10-20 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekwwweit">
                    20+ years
                  </MultiSelectItem>
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
            <MultiSelect>
              <MultiSelectTrigger className="w-full ">
                <MultiSelectValue placeholder="Coupon (%)" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  <MultiSelectItem value="next.js">0-2 years</MultiSelectItem>
                  <MultiSelectItem value="sveltekit">2-5 years</MultiSelectItem>
                  <MultiSelectItem value="sveltwekit">
                    5-10 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekeit">
                    10-20 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekwwweit">
                    20+ years
                  </MultiSelectItem>
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
            <MultiSelect>
              <MultiSelectTrigger className="w-full ">
                <MultiSelectValue placeholder="Interest Payment" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  <MultiSelectItem value="next.js">0-2 years</MultiSelectItem>
                  <MultiSelectItem value="sveltekit">2-5 years</MultiSelectItem>
                  <MultiSelectItem value="sveltwekit">
                    5-10 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekeit">
                    10-20 years
                  </MultiSelectItem>
                  <MultiSelectItem value="sveltekwwweit">
                    20+ years
                  </MultiSelectItem>
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreBondsHeader;
