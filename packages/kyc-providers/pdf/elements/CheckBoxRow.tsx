import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import CheckIcon from "../elements/CheckIcon";
export const CheckBoxRow = ({
  label = "No",
  checked = false,
}: {
  label: string;
  checked?: boolean;
}) => (
  <View style={tw("flex flex-row items-center")}>
    <CheckIcon checked={checked} size={10} />
    <Text style={tw("ml-2 text-xs mt-[-3px]")}>{label}</Text>
  </View>
);
