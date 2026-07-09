import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function Page6({ eAaDhar }: { eAaDhar?: string }) {
  return (
    <View style={tw(`px-4 h-[70%] d-flex justify-center items-center`)}>
      {eAaDhar && <Image
        style={tw(`w-[80%] h-auto object-contain`)}
        source={{
          uri: `data:image/png;base64,${eAaDhar}`,
        }}
      />}
      {!eAaDhar && <Text style={tw(`text-center`)} >Aadhaar details verified successfully through ITD</Text>}
      {/* <View style={tw(`w-20 h-20 bg-white absolute left-28 top-8`)} />
      <View style={tw(`w-96 h-20 bg-white absolute left-42 bottom-8`)} /> */}
    </View>
  );
}

export default Page6;
