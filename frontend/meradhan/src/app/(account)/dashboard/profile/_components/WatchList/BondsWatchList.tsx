"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { formatDateCustom } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { BondDetailsResponse } from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { BsArrowUpRightSquareFill } from "react-icons/bs";
import { FaEye, FaTrash } from "react-icons/fa";
import NeedKyc from "../NeedKyc";
import { Loader } from "lucide-react";
import useAppCookie from "@/hooks/useAppCookie.hook";

function BondsWatchList() {
  const { cookies } = useAppCookie();
  const bondsWatchList = useQuery({
    queryKey: ["bondsWatchList"],
    queryFn: async () => {
      if (!cookies.userId) {
        return { data: [] };
      }
      return await apiClientCaller.get<BondDetailsResponse[]>(
        "/watchlist/bonds"
      );
    },
  });

  // Add To Watchlist Mutation
  const addToWatchList = useMutation({
    mutationKey: ["addBondsWatchList"],
    mutationFn: async (isin: string) =>
      await apiClientCaller.get("/watchlist/bonds/manage", {
        params: { isin },
      }),
    onSuccess: () => {
      bondsWatchList.refetch();
      toast.success("removed To Watchlist");
    },
    onError: () => {
      bondsWatchList.refetch();
      toast.error("Failed To Remove Watchlist");
    },
  });

  if (bondsWatchList.data?.data.length == 0) {
    return (
      <NeedKyc
        key={4}
        title={`No Bonds In WatchList`}
        buttonText="Explore Bonds"
      />
    );
  }

  if (bondsWatchList.isLoading) {
    return (
      <div className="h-80 w-full flex justify-center items-center">
        <Loader className="animate animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-5">
      <Table>
        <TableHeader>
          <TableRow className="rounded-xl overflow-hidden border-white">
            <TableHead className="w-[100px] rounded-md bg-[#F5F5F5] rounded-r-none py-4 px-6">
              ISIN
            </TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Issuer</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Face Value</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Coupon</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">
              Maturity Date
            </TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6 w-32 rounded-md rounded-l-none">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="border-b border-gray-100 ">
          {bondsWatchList.data?.data.map((e) => {
            return (
              <TableRow key={e.id}>
                <TableCell className="text-primary  py-4 px-6">
                  <Link
                    href={`/bonds/detail/${e.isin}`}
                    className="flex items-center gap-3"
                  >
                    {e.isin}{" "}
                    <BsArrowUpRightSquareFill className="text-secondary" />
                  </Link>
                </TableCell>
                <TableCell className="py-4 px-6">{e.bondName}</TableCell>
                <TableCell className="py-4 px-6">
                  {formatNumberTS(e.faceValue)}
                </TableCell>
                <TableCell className="py-4 px-6">{e.couponRate}%</TableCell>
                <TableCell className="py-4 px-6">
                  {formatDateCustom(e.maturityDate)}
                </TableCell>
                <TableCell className="py-4 px-6 flex items-center gap-4 text-xl">
                  <Link
                    href={`/bonds/detail/${e.isin}`}
                    className="cursor-pointer"
                  >
                    <FaEye className="text-primary" />
                  </Link>
                  <FaTrash
                    size={17}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => addToWatchList.mutate(e.isin)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default BondsWatchList;
