import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaEye } from "react-icons/fa6";

import { PiCurrencyInrBold } from "react-icons/pi";

function OrdersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className=" rounded-xl overflow-hidden border-white">
          <TableHead className="w-[100px] rounded-md bg-[#F5F5F5] rounded-r-none">
            Order ID
          </TableHead>
          <TableHead className="bg-[#F5F5F5]">Bond Type</TableHead>
          <TableHead className="bg-[#F5F5F5]">Security Name</TableHead>
          <TableHead className="bg-[#F5F5F5]">Face Value</TableHead>
          <TableHead className="bg-[#F5F5F5]">Quantity</TableHead>
          <TableHead className="bg-[#F5F5F5]">Value</TableHead>
          <TableHead className="bg-[#F5F5F5]">Request Date</TableHead>
          <TableHead className="bg-[#F5F5F5]">Status</TableHead>
          <TableHead className="bg-[#F5F5F5] rounded-r-md text-center">
            Payment Ref.
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="border-b border-gray-100">
        {Array.from({ length: 10 }).map((e, i) => {
          return (
            <TableRow key={i}>
              <TableCell>MD0123456</TableCell>
              <TableCell>Secondary</TableCell>
              <TableCell>
                Motilal Oswal Financial Services Limited <br /> Issuer: MOF01
              </TableCell>
              <TableCell>
                <div className="flex items-center ">
                  <PiCurrencyInrBold /> 1,000.00
                </div>
              </TableCell>
              <TableCell>47</TableCell>
              <TableCell>
                <div className="flex items-center ">
                  <PiCurrencyInrBold /> 47,000.00
                </div>
              </TableCell>
              <TableCell>21 Dec 2024</TableCell>
              <TableCell className="font-semibold text-red-500">
                Rejected
              </TableCell>
              <TableCell>
                <div className="text-center flex justify-center items-center text-primary">
                  <FaEye size={22} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default OrdersTable;
