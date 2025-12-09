/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function TextList({
  children,
  count,
  className = "text-xs",
}: {
  children?: any;
  count?: string;
  fontSize?: number;
  className?: string;
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
      <Text style={[tw(` leading-[5px] w-full ${className}`)]}>{children}</Text>
    </View>
  );
}

export default TextList;
