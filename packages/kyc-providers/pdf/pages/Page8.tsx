import { Image, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

function Page8({ face }: { face: string }) {
  return (
    <View style={tw(`px-4 h-[70%] d-flex justify-center items-center`)}>
      <Image style={tw(` mt-10 max-h-[70%] w-[50%]`)} source={face} />
    </View>
  );
}

export default Page8;
