import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import CheckIcon from "../elements/CheckIcon";
export const CheckBoxRow = ({
  label = "No",
  checked = false,
  fontSize,
}: {
  label: string;
  checked?: boolean;
  fontSize?: number;
}) => (
  <View style={tw("flex flex-row items-center")}>
    <CheckIcon checked={checked} size={10} />
    <Text style={[tw("ml-2 text-xs mt-[-3px]"), fontSize != null ? { fontSize } : {}]}>
      {label}
    </Text>
  </View>
);
