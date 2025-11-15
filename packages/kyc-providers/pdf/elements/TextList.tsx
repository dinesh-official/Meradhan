/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function TextList({
  children,
  count,
  fontSize,
}: {
  children?: any;
  count?: string;
  fontSize?: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
      }}
    >
      <Text style={tw(`text-xs leading-[5px]  w-[18px] text-left`)}>
        {count}
      </Text>
      {/* <Text style={{ fontSize: fontSize || 9, lineHeight: 1.4, width: "100%" }}> */}
      <Text style={tw(`text-xs leading-[5px] w-full`)}>{children}</Text>
    </View>
  );
}

export default TextList;
