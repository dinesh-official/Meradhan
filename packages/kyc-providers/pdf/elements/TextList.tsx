import { Text, View } from "@react-pdf/renderer";
import React from "react";

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
      <Text style={{ marginRight: 8, fontSize: fontSize || 10 }}>{count}</Text>
      <Text
        style={{ fontSize: fontSize || 10, lineHeight: 1.4, width: "100%" }}
      >
        {children}
      </Text>
    </View>
  );
}

export default TextList;
