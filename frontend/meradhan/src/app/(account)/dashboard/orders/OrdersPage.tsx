"use client";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import OrdersTable from "./OrdersTable";
import CardPagination from "@/global/elements/CardPagination";
function OrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center  mb-8">
        <div className="hidden md:flex gap-1 font-medium text-xl sm:text-2xl">
          My <span className="font-bold"> Orders</span>
        </div>
        <div className="w-full flex justify-end items-center gap-5">
          <MultiSelect defaultValues={[]} onValuesChange={() => {}}>
            <MultiSelectTrigger className="shadow-none w-44 border border-gray-200 hover:border-gray-200 focus:border-gray-200">
              <MultiSelectValue placeholder="All Orders" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectGroup>
                {[
                  {
                    title: "All Orders",
                    value: "all_orders",
                  },
                  {
                    title: "Settled",
                    value: "settled_orders",
                  },
                  {
                    title: "Pending",
                    value: "pending_orders",
                  },
                  {
                    title: "Applied",
                    value: "applied_orders",
                  },
                  { title: "Rejected", value: "rejected_orders" },
                ].map((option) => (
                  <MultiSelectItem key={option.value} value={option.value}>
                    {option.title}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>

          <MultiSelect defaultValues={[]} onValuesChange={() => {}}>
            <MultiSelectTrigger className="shadow-none w-44 border border-gray-200 hover:border-gray-200 focus:border-gray-200">
              <MultiSelectValue placeholder="Bond Type" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectGroup>
                {[
                  {
                    title: "All Bond Types",
                    value: "all_bond_types",
                  },
                ].map((option) => (
                  <MultiSelectItem key={option.value} value={option.value}>
                    {option.title}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
        </div>
      </div>
      <OrdersTable />
      <div className="flex mt-5 justify-between items-center">
        <div>
          <CardPagination page={1} totalPages={10} />
        </div>
        <p className="text-sm">Displaying 1 to 10 of 580 orders</p>
      </div>
    </div>
  );
}

export default OrdersPage;
