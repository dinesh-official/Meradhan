import { Image, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";



function Page9({ sign }: { sign: string }) {
  return (
    <View style={tw(`px-4 h-[70%] d-flex justify-center items-center`)}>
      <Image style={tw(` mt-10 max-h-[70%] w-[50%]`)} source={sign} />
    </View>
  );
}

export default Page9;
