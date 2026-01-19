"use client";
import { fetchIssuerNotesWatchList } from "@/app/(others)/issuer-notes/_action/isshueNotesClient";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryClient } from "@/core/config/service-clients";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { getRatingColor } from "@/global/components/Bond/CreaditRatingBadge";
import { formatDateCustom } from "@/global/utils/datetime.utils";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BsArrowUpRightSquareFill } from "react-icons/bs";
import { FaEye, FaTrash } from "react-icons/fa";
import NeedKyc from "../NeedKyc";
import useAppCookie from "@/hooks/useAppCookie.hook";

function IssuerWatchList() {
  const { cookies } = useAppCookie();
  const issuerWatchList = useQuery({
    queryKey: ["issuerWatchList"],
    queryFn: async () => {
      if (!cookies.userId) {
        return [];
      }

      const ids = await apiClientCaller.get<string[]>("/watchlist/issuer");

      if (ids.data.length == 0) {
        return [];
      }
      return await fetchIssuerNotesWatchList(ids.data);
    },
  });
  if (issuerWatchList.isLoading) {
    return (
      <div className="h-80 w-full flex justify-center items-center">
        <Loader className="animate animate-spin" />
      </div>
    );
  }
  if (issuerWatchList.data?.length == 0) {
    return (
      <NeedKyc
        key={4}
        title={`No Issue Notes WatchList`}
        desc={`to add Issue Notes profile!`}
        buttonText="Explore Issue Notes"
        href="/issuer-notes"
      />
    );
  }

  return (
    <div className="mt-5">
      <Table>
        <TableHeader>
          <TableRow className="rounded-xl overflow-hidden border-white">
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Issuer</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Rating</TableHead>
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
          {issuerWatchList?.data?.map((e) => {
            return (
              <IssuerWatchListItem
                key={e.documentId}
                documentId={e.documentId}
                isin={JSON.parse(e.ISIN).value}
                name={e.Issuer_Name}
                slug={e.Slug}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default IssuerWatchList;

function IssuerWatchListItem({
  documentId,
  name,
  slug,
  isin,
}: {
  isin: string;
  name: string;
  slug: string;
  documentId: string;
}) {
  const apiGt = new apiGateway.bondsApi.BondsApi(apiClientCaller);
  const { data, isLoading } = useQuery({
    queryKey: ["bond", isin],
    queryFn: async () => {
      const { responseData } = await apiGt.getBondDetailsByIsin(isin);
      return responseData;
    },
  });

  // Add To Watchlist Mutation
  const addToWatchList = useMutation({
    retry: 1,

    mutationKey: ["addIssuerWatchList", documentId],
    mutationFn: async (issuerId: string) =>
      await apiClientCaller.get("/watchlist/issuer/manage", {
        params: { issuerId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issuerWatchList"],
      });
      toast.success("removed To WatchList");
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["issuerWatchList"],
      });
      toast.error("Failed To Remove WatchList");
    },
  });

  if (isLoading) {
    <TableRow className=" py-4 px-6">
      <p>Loading....</p>
    </TableRow>;
  }

  return (
    <TableRow>
      <TableCell className="text-primary  py-4 px-6">
        <Link
          href={`/issuer-notes/${slug}`}
          className="flex items-center gap-3 font-semibold"
        >
          {name} <BsArrowUpRightSquareFill className="text-secondary" />
        </Link>
      </TableCell>

      <TableCell className="py-4 px-6">
        <Badge
          style={{
            backgroundColor: getRatingColor(data?.creditRating || "AA"),
          }}
        >
          {data?.creditRating}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-6">{data?.couponRate}%</TableCell>
      <TableCell className="py-4 px-6">
        {formatDateCustom(data?.maturityDate || "")}
      </TableCell>
      <TableCell className="py-4 px-6 flex items-center gap-4 text-xl">
        <Link href={`/issuer-notes/${slug}`} className="cursor-pointer">
          <FaEye className="text-primary" />
        </Link>
        <FaTrash
          size={17}
          className="text-gray-400 cursor-pointer"
          onClick={() => {
            addToWatchList.mutate(documentId);
          }}
        />
      </TableCell>
    </TableRow>
  );
}
