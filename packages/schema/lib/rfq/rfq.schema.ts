import z from "zod";

export const addIsinSchema = z
  .object({
    segment: z.enum(["R", "C"]).default("R"),
    isin: z.string({ error: "ISIN is required" }).min(1, "ISIN is required"),
    participantCode: z
      .string({ error: "Participant Code is required" })
      .min(1, "Participant Code is required"),
    dealType: z.enum(["D", "B"]),
    clientCode: z.string({ error: "Client Code is required" }),
    institutions: z.boolean().optional(),
    buySell: z.enum(["B", "S", "X"]),
    quoteType: z.enum(["Y", "B"]),
    settlementType: z.enum(["0", "1"]),
    value: z.coerce
      .number({ error: "Enter RFQ Size" })
      .min(0, "RFQ Size must be greater than 0"),
    quantity: z.coerce.number({ error: "Enter Quantity" }).optional(),
    yieldType: z.enum(["YTM", "YTP", "YTC"]),
    yield: z.coerce
      .number({ error: "Enter Yield" })
      .min(0, "Yield must be non-negative"),
    calcMethod: z.enum(["M", "O"]),
    price: z.coerce.number({ error: "Enter Price" }).optional(),
    valueSell: z.coerce.number({ error: "Enter Sell Value" }).optional(),
    quantitySell: z.coerce.number({ error: "Enter Sell Quantity" }).optional(),
    yieldTypeSell: z.enum(["YTM", "YTP", "YTC"]).optional(),
    yieldSell: z.coerce.number({ error: "Enter Sell Yield" }).optional(),
    calcMethodSell: z.enum(["M", "O"]).optional(),
    priceSell: z.coerce.number({ error: "Enter Sell Price" }).optional(),
    gtdFlag: z.enum(["Y"]).nullable().optional(),
    endTime: z.string({ error: "Enter End Time" }).optional(),
    quoteNegotiable: z.enum(["Y"]).nullable().optional(),
    valueNegotiable: z.enum(["Y"]).nullable().optional(),
    minFillValue: z.coerce
      .number({ error: "Enter Minimum Fill Value" })
      .optional(),
    valueStepSize: z.coerce
      .number({ error: "Enter Value Step Size" })
      .optional(),
    anonymous: z.enum(["Y"]).nullable().optional(),
    access: z.enum(["1", "2", "3"], {
      error: "Access type is required",
    }),
    groupList: z.array(z.number()).optional(),
    participantList: z.array(z.string()).optional(),
    category: z.string().optional(),
    rating: z.string().optional(),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Price required when quote type is Both
    if (data.quoteType === "B" && !data.price) {
      ctx.addIssue({
        code: "custom",
        message: "Price required when Quote Type is Both",
        path: ["price"],
      });
    }

    // Validation for brokered deal type
    if (data.dealType === "B") {
      if (!data.clientCode) {
        ctx.addIssue({
          code: "custom",
          message: "Client Code is required for Brokered deals",
          path: ["clientCode"],
        });
      }
    }

    // Validation for sell fields when buySell is Both
    if (data.buySell === "X") {
      const sellFields = [
        {
          field: "valueSell",
          message: "Sell Value is required when Buy/Sell is Both",
        },
        {
          field: "quantitySell",
          message: "Sell Quantity is required when Buy/Sell is Both",
        },
        {
          field: "yieldTypeSell",
          message: "Sell Yield Type is required when Buy/Sell is Both",
        },
        {
          field: "yieldSell",
          message: "Sell Yield is required when Buy/Sell is Both",
        },
        {
          field: "calcMethodSell",
          message: "Sell Calc Method is required when Buy/Sell is Both",
        },
        {
          field: "priceSell",
          message: "Sell Price is required when Buy/Sell is Both",
        },
      ];

      sellFields.forEach(({ field, message }) => {
        if (!data[field as keyof typeof data]) {
          ctx.addIssue({
            code: "custom",
            message,
            path: [field],
          });
        }
      });
    }

    if (data.gtdFlag != "Y" && !data.endTime) {
      ctx.addIssue({
        code: "custom",
        message: "End Time is required when GTD is set",
        path: ["endTime"],
      });
    }
  });

export const acceptNegotiationQuoteSchema = z.object({
  rfqNumber: z
    .string({ error: "RFQ Number is required" })
    .min(1, "RFQ Number is required"),
  acceptedValue: z
    .float32({ error: "Accepted Value is required" })
    .min(0, "Accepted Value must be non-negative"),
  id: z.string().optional(),
  acceptedSettlementDate: z.string().optional(),
  acceptedYieldType: z.enum(["YTM", "YTP", "YTC"]).optional(),
  acceptedYield: z.float32().optional(),
  acceptedPrice: z.float32().optional(),
  respDealType: z.enum(["D", "B"]),
  respClientCode: z.string().optional(),
  role: z.enum(["I", "R"]).optional(),
});

export const terminateNegotiationQuoteSchema = z.object({
  rfqNumber: z
    .string({ error: "RFQ Number is required" })
    .min(1, "RFQ Number is required"),
  id: z.string(),
  role: z.enum(["I", "R"]),
});

export const acceptRejectDealSchema = z.object({
  rfqNumber: z
    .string({ error: "RFQ Number is required" })
    .min(1, "RFQ Number is required"),
  id: z
    .string({ error: "Negotiation ID is required" })
    .min(1, "Negotiation ID is required"),
  acceptedPrice: z.coerce
    .number({ error: "Accepted Price is required" })
    .optional(),
  acceptedPutCallDate: z.string().optional(),
  acceptedAccruedInterest: z.coerce
    .number({ error: "Accepted Accrued Interest is required" })
    .optional(),
  acceptedConsideration: z.coerce
    .number({ error: "Accepted Consideration is required" })
    .optional(),
  confirmStatus: z.enum(["PC", "PR"], { error: "Confirm Status is required" }),
});

export const rfqFilterSchema = z
  .object({
    number: z.string().optional(),
    date: z.string().optional(),
    isin: z.string().optional(),
    participantCode: z.string().optional(),
    clientRegType: z.enum(["U", "I", "R"]).optional(),
    status: z.enum(["P", "W", "T"]).optional(),
  })
  .optional();

export const rfqNegotiationFilterSchema = z.object({
  rfqNumber: z.string().max(15).optional(), // RFQ Number
  id: z.string().max(15).optional(), // Negotiation Thread Id
  date: z.string().optional(), // Date
  isin: z.string().max(12).optional(), // ISIN
  buySell: z.enum(["B", "S"]).optional(), // Buy/Sell
  status: z.enum(["N", "R", "A", "C", "E"]).optional(), // Status
  tradeNumber: z.string().max(15).optional(), // Trade number
  confirmStatus: z.enum(["PP", "PC", "PR", "CA", "CC", "CR"]).optional(), // Confirm status
  fromTimestamp: z.string().optional(), // From timestamp
  toTimestamp: z.string().optional(), // To timestamp
});

export const proposeDealSchema = z.object({
  ngRfqNumber: z
    .string({
      error: "RFQ Number is required",
    })
    .min(1)
    .max(15), // String(15) Yes
  ngId: z
    .string({
      error: "Negotiation ID is required",
    })
    .min(1)
    .max(15), // String(15) Yes
  participantCode: z
    .string({
      error: "Participant Code is required",
    })
    .min(1)
    .max(30), // String(30) Yes
  dealType: z.enum(["D", "B"]), // String(1) Yes
  clientCode: z
    .string({
      error: "Client Code is required",
    })
    .min(1)
    .max(30), // String(30) Yes
  price: z
    .float32({
      error: "Price is required",
    })
    .min(1), // Decimal(3,4) but string
  accruedInterest: z.float32({
    error: "Accrued Interest is required",
  }), // Decimal(15,2) but string
  consideration: z.float32({
    error: "Consideration is required",
  }), // Decimal(15,2) but string
  calcMethod: z.enum(["M", "O"]), // String(1) Yes
  putCallDate: z.string().optional(), // Date (optional)
  remarks: z.string().optional(), // String(100) optional
  role: z.enum(["I", "R"]), // String(1) optional
});

export const settleOrderFilterSchema = z.object({
  id: z.number().optional(),
  orderNumber: z.string().max(15).optional(),
  filtFromModSettleDate: z.string(),
  filtToModSettleDate: z.string(),
  filtCounterParty: z.string().max(30).optional(),
});

export const dealAmendFilterSchema = z.object({
  id: z.number().optional(),
  rfqNumber: z.string().max(15).optional(),
  ngId: z.string().optional(),
  requestType: z.enum(["M", "C"]).optional(),
  filtFromDate: z.string().optional(),
  filtToDate: z.string().max(30).optional(),
});
