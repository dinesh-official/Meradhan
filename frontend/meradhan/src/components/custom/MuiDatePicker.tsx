"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function MuiDatePicker() {
  return (
    <DatePicker
      format="DD/MM/YYYY"
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
