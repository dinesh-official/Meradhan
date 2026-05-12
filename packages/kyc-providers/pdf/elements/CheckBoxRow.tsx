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
  /** When set, overrides default label text size (e.g. compact PDF rows). */
  fontSize?: number;
}) => (
  <View style={tw("flex flex-row items-center")}>
    <CheckIcon checked={checked} size={10} />
    <Text
      style={[
        tw("ml-2 mt-[-3px]"),
        fontSize !== undefined ? { fontSize } : tw("text-xs"),
      ]}
    >
      {label}
    </Text>
  </View>
);
