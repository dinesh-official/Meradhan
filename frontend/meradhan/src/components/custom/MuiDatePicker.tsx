"use client";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function MuiDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  return (
    <DatePicker
      format="DD/MM/YYYY"
      value={dayjs(value)}
      onChange={(date) => onChange(date?.toISOString() || "")}
      slotProps={{
        textField: {
          variant: "standard",
          InputProps: {
            disableUnderline: true,
          },
          sx: {
            padding: 0,
            "& input": {
              padding: 0,
            },
          },
        },
      }}
    />
  );
}

export default MuiDatePicker;
