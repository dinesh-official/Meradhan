/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function TextList({
  children,
  count,
  className = "text-xs",
  countFontSize = 9,
  countWidth,
}: {
  children?: any;
  count?: string;
  fontSize?: number;
  className?: string;
  countFontSize?: number;
  countWidth?: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
      }}
    >
      <Text style={[tw(`leading-[6px]  w-[18px] text-left`), countFontSize ? { fontSize: countFontSize, width: countWidth } : {}]}>
        {count}
      </Text>
      {/* <Text style={{ fontSize: fontSize || 9, lineHeight: 1.4, width: "100%" }}> */}
      <Text
        style={[
          tw(` leading-[6px] w-full ${className}`),
          { lineHeight: 1.6, width: "100%" },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export default TextList;
