/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function TextFiled({
  title,
  value,
  className,
}: {
  title?: any;
  value?: string;
  className?: string;
}) {
  return (
    <View
      style={tw(`text-xs flex flex-row w-full justify-center items-center`)}
    >
      <Text style={tw(` w-auto ${className}`)}>{title}</Text>
      <View style={tw(`border-b  border-gray-200 w-[100%] py-[4px] `)}>
        <Text style={tw(`w-full font-[500]`)}>{value}</Text>
      </View>
    </View>
  );
}

export default TextFiled;
