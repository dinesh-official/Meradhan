// "use client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import NseIsinPicker from "@/global/elements/autocomplete/NseIsinPicker";
// import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
// import { InputField } from "@/global/elements/inputs/InputField";
// import { SelectField } from "@/global/elements/inputs/SelectField";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { NSE_ISIN_DATA } from "@root/apiGateway";
// import { appSchema } from "@root/schema";
// import { addDays } from "date-fns";
// import { useState } from "react";
// import { Form, SubmitHandler, useForm } from "react-hook-form";
// import z from "zod";

// // Ratings
// export const RATINGS = [
//   { code: "AAA", description: "AAA" },
//   { code: "AA+", description: "AA+" },
//   { code: "AA", description: "AA" },
//   { code: "AA-", description: "AA-" },
//   { code: "A+", description: "A+" },
//   { code: "A", description: "A" },
//   { code: "A-", description: "A-" },
//   { code: "BBB+", description: "BBB+" },
//   { code: "BBB", description: "BBB" },
//   { code: "BBB-", description: "BBB-" },
//   { code: "BB+", description: "BB+" },
//   { code: "BB", description: "BB" },
//   { code: "BB-", description: "BB-" },
//   { code: "B+", description: "B+" },
//   { code: "B", description: "B" },
//   { code: "B-", description: "B-" },
//   { code: "C+", description: "C+" },
//   { code: "C", description: "C" },
//   { code: "C-", description: "C-" },
//   { code: "UNRATED", description: "UNRATED" },
//   { code: "OTHER", description: "OTHER" },
//   { code: "SOVEREIGN", description: "SOVEREIGN" },
// ];
// // Sectors
// export const SECTORS = [
//   { code: "NBFC", description: "NBFC" },
//   { code: "HFC", description: "HFC" },
//   { code: "PSU Bank", description: "PSU Bank" },
//   { code: "Private Bank", description: "Private Bank" },
//   { code: "PSU", description: "PSU" },
//   { code: "Manufacturing", description: "Manufacturing" },
//   { code: "Sovereign", description: "Sovereign" },
//   {
//     code: "Public Financial Institutions",
//     description: "Public Financial Institutions",
//   },
//   { code: "Others", description: "Others" },
// ];

// // Constants (matching your existing schema)
// export const YIELD_TYPES = ["YTM", "YTP", "YTC"] as const;

// // Date utility function
// const dateTimeUtils = {
//   formatDateTime: (date: Date | number, format: string) => {
//     const d = new Date(date);
//     if (format === "DD/MM/YYYY") {
//       return d.toLocaleDateString("en-GB");
//     }
//     return d.toLocaleDateString();
//   },
// };

// type SchemaType = z.infer<typeof appSchema.rfq.addIsinSchema>;

// function MyFOrmPage() {
//   const {
//     handleSubmit,
//     watch,
//     control,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(appSchema.rfq.addIsinSchema),
//     defaultValues: {
//       segment: "R",
//       dealType: "D",
//       buySell: "B",
//       quoteType: "Y",
//       settlementType: "0",
//       yieldType: "YTM",
//       calcMethod: "O",
//       institutions: false,
//     },
//   });

//   const onSubmit: SubmitHandler<SchemaType> = (data) => {
//     console.log("Form submitted:", data);
//   };

//   const [isin, setIsin] = useState<NSE_ISIN_DATA | undefined>(undefined);

//   return (
//     <Form control={control} className="space-y-6 p-5">
//       <Card>
//         <CardHeader>
//           <CardTitle>Information</CardTitle>
//           {isin && (
//             <div className="space-y-2 bg-muted/30 mt-3 p-4 border rounded-lg">
//               <div className="flex flex-wrap items-center gap-2">
//                 <span className="font-medium text-muted-foreground text-sm">
//                   ISIN:
//                 </span>
//                 <span className="font-semibold text-sm">{isin.symbol}</span>
//                 <span className="text-muted-foreground text-sm">•</span>
//                 <span className="text-sm">{isin.description}</span>
//               </div>

//               <div className="gap-y-1 grid grid-cols-1 md:grid-cols-2 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">Face Value:</span>{" "}
//                   {isin.faceValue}
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Coupon:</span>{" "}
//                   {isin.couponRate}
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Issuer:</span>{" "}
//                   {isin.issuer}
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Maturity:</span>{" "}
//                   {dateTimeUtils.formatDateTime(
//                     new Date(isin.maturityDate),
//                     "DD/MM/YYYY"
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardHeader>
//         <CardContent>
//           <div className="gap-5 grid md:grid-cols-2">
//             <NseIsinPicker
//               onSelect={(e) => {
//                 setValue("isin", e.symbol);
//                 setIsin(e);
//               }}
//             >
//               <InputField
//                 value={watch("isin")}
//                 label="ISIN"
//                 required
//                 error={errors.isin?.message}
//               />
//             </NseIsinPicker>

//             <SelectField
//               label="Segment"
//               placeholder="Select Segment"
//               options={[
//                 {
//                   label: "Normal RFQ (R)",
//                   value: "R",
//                 },
//                 {
//                   label: "CDMDF RFQ (C)",
//                   value: "C",
//                 },
//               ]}
//               value={watch("segment")}
//               onChangeAction={(e) =>
//                 setValue("segment", e as SchemaType["segment"])
//               }
//               error={errors.segment?.message}
//             />

//             <SelectField
//               label="Buy/Sell"
//               placeholder="Select Buy/Sell"
//               required
//               options={[
//                 {
//                   label: "Buy (B)",
//                   value: "B",
//                 },
//                 {
//                   label: "Sell (S)",
//                   value: "S",
//                 },
//                 {
//                   label: "Both (X)",
//                   value: "X",
//                 },
//               ]}
//               value={watch("buySell")}
//               onChangeAction={(e) =>
//                 setValue("buySell", e as SchemaType["buySell"])
//               }
//               error={errors.buySell?.message}
//             />

//             <SelectField
//               label="Quote Type"
//               placeholder="Select Quote Type"
//               required
//               options={[
//                 {
//                   label: "Only Yield",
//                   value: "Y",
//                 },
//                 {
//                   label: "Both Price and Yield",
//                   value: "B",
//                 },
//               ]}
//               value={watch("quoteType")}
//               onChangeAction={(e) =>
//                 setValue("quoteType", e as SchemaType["quoteType"])
//               }
//               error={errors.quoteType?.message}
//             />

//             <div className="gap-5 grid md:grid-cols-3 md:col-span-2">
//               <SelectField
//                 label="Deal Type"
//                 placeholder="Select deal type"
//                 required
//                 options={[
//                   {
//                     label: "Direct",
//                     value: "D",
//                   },
//                   {
//                     label: "Brokered",
//                     value: "B",
//                   },
//                 ]}
//                 value={watch("dealType")}
//                 onChangeAction={(e) =>
//                   setValue("dealType", e as SchemaType["dealType"])
//                 }
//                 error={errors.dealType?.message}
//               />
//               {watch("dealType") == "B" && (
//                 <FormCheckbox
//                   label="Institutions"
//                   checked={watch("institutions") || false}
//                   onCheckedChange={(e) => setValue("institutions", e)}
//                   error={errors.institutions?.message}
//                 />
//               )}
//               {watch("dealType") == "B" && (
//                 <InputField
//                   id="clientcode"
//                   label="Client Code"
//                   required
//                   placeholder="Enter Client Code"
//                   value={watch("clientCode") || ""}
//                   onChangeAction={(e) => setValue("clientCode", e)}
//                   error={errors.clientCode?.message}
//                 />
//               )}
//             </div>

//             <div className="gap-5 grid md:grid-cols-3 md:col-span-2">
//               <InputField
//                 id="value"
//                 label="RFQ Size (Value in Crores)"
//                 placeholder="RFQ Size (Value in Crores)"
//                 value={watch("value")?.toString()}
//                 required
//                 onChangeAction={(e) => setValue("value", Number(e))}
//                 error={errors.value?.message}
//               />

//               <SelectField
//                 label="Settlement  Date"
//                 placeholder="Settlement  Date"
//                 options={[
//                   {
//                     label: `T+0 (${dateTimeUtils.formatDateTime(
//                       new Date(),
//                       "DD/MM/YYYY"
//                     )})`,
//                     value: "0",
//                   },
//                   {
//                     label: `T+1 (${dateTimeUtils.formatDateTime(
//                       addDays(Date.now(), 1),
//                       "DD/MM/YYYY"
//                     )})`,
//                     value: "1",
//                   },
//                 ]}
//                 required
//                 value={watch("settlementType")}
//                 onChangeAction={(e) =>
//                   setValue("settlementType", e as SchemaType["settlementType"])
//                 }
//                 error={errors.settlementType?.message}
//               />
//               <InputField
//                 id="Quantity"
//                 label="Quantity (Auto Calculated)"
//                 placeholder="Auto Calculated"
//                 type="number"
//                 // disabled

//                 value={watch("quantity")?.toString()}
//                 onChangeAction={(e) => setValue("quantity", Number(e))}
//                 error={errors.quantity?.message}
//               />

//               <SelectField
//                 label="Yield Type"
//                 placeholder="Yield to Maturity(YTM)"
//                 options={YIELD_TYPES.map((s) => ({ label: s, value: s }))}
//                 value={watch("yieldType")}
//                 required
//                 onChangeAction={(e) =>
//                   setValue("yieldType", e as SchemaType["yieldType"])
//                 }
//                 error={errors.yieldType?.message}
//               />

//               <InputField
//                 id="yield"
//                 label="Yield"
//                 placeholder="Enter yield %"
//                 type="number"
//                 value={watch("yield")?.toString()}
//                 onChangeAction={(e) => setValue("yield", Number(e))}
//                 error={errors.yield?.message}
//                 required
//               />

//               <SelectField
//                 label="Calc Method"
//                 placeholder="Select Calc Method"
//                 options={[
//                   { label: "Money Market", value: "M" },
//                   { label: "Other", value: "O" },
//                 ]}
//                 value={watch("calcMethod")}
//                 required
//                 onChangeAction={(e) =>
//                   setValue("calcMethod", e as SchemaType["calcMethod"])
//                 }
//                 error={errors.calcMethod?.message}
//               />
//               {watch("buySell") == "X" && (
//                 <InputField
//                   id="price"
//                   label="Price"
//                   placeholder="Enter Price"
//                   type="number"
//                   value={watch("price")?.toString()}
//                   onChangeAction={(e) => setValue("price", Number(e))}
//                   error={errors.price?.message}
//                 />
//               )}
//               {watch("buySell") == "X" && (
//                 <div className="gap-5 grid md:grid-cols-3 col-span-3">
//                   <InputField
//                     id="valueSell"
//                     label="Value Sell"
//                     placeholder="Enter Value Sell"
//                     type="number"
//                     value={watch("valueSell")?.toString()}
//                     onChangeAction={(e) => setValue("valueSell", Number(e))}
//                     error={errors.valueSell?.message}
//                   />
//                   <InputField
//                     id="quantitySell"
//                     label="Quantity Sell"
//                     type="number"
//                     placeholder="Enter Quantity Sell"
//                     value={watch("quantitySell")?.toString()}
//                     onChangeAction={(e) => setValue("quantitySell", Number(e))}
//                     error={errors.quantitySell?.message}
//                   />
//                   <SelectField
//                     label="Yield Type Sell"
//                     placeholder="Select Yield Type Sell"
//                     options={YIELD_TYPES.map((s) => ({ label: s, value: s }))}
//                     value={watch("yieldTypeSell") || ""}
//                     onChangeAction={(e) =>
//                       setValue(
//                         "yieldTypeSell",
//                         e as SchemaType["yieldTypeSell"]
//                       )
//                     }
//                     error={errors.yieldTypeSell?.message}
//                   />
//                   <InputField
//                     id="yieldSell"
//                     label="Yield Sell"
//                     placeholder="Enter Yield Sell"
//                     type="number"
//                     value={watch("yieldSell")?.toString()}
//                     onChangeAction={(e) => setValue("yieldSell", Number(e))}
//                     error={errors.yieldSell?.message}
//                   />
//                   <SelectField
//                     label="Calc Method Sell"
//                     placeholder="Select Calc Method Sell"
//                     options={[
//                       { label: "Money Market", value: "M" },
//                       { label: "Other", value: "O" },
//                     ]}
//                     value={watch("calcMethodSell") || ""}
//                     onChangeAction={(e) =>
//                       setValue(
//                         "calcMethodSell",
//                         e as SchemaType["calcMethodSell"]
//                       )
//                     }
//                     error={errors.calcMethodSell?.message}
//                   />
//                   <InputField
//                     id="priceSell"
//                     label="Price Sell"
//                     type="number"
//                     placeholder="Enter Price Sell"
//                     value={watch("priceSell")?.toString()}
//                     onChangeAction={(e) => setValue("priceSell", Number(e))}
//                     error={errors.priceSell?.message}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Trading Options</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="gap-4 grid md:grid-cols-3">
//             <FormCheckbox
//               label="RFQ Valid Till Market Close"
//               checked={watch("gtdFlag") == "Y"}
//               onCheckedChange={(e) => {
//                 setValue("gtdFlag", e ? "Y" : null);
//               }}
//             />

//             <InputField
//               id="rfqexpirytime"
//               label="RFQ Expiry Time"
//               placeholder="--:--"
//               type="time"
//               value={watch("endTime") || ""}
//               onChangeAction={(e) => setValue("endTime", e)}
//               error={errors.endTime?.message}
//               disabled={watch("gtdFlag") !== "Y"}
//             />

//             <FormCheckbox
//               label="Quote Negotiable"
//               checked={watch("quoteNegotiable") == "Y"}
//               onCheckedChange={() => {
//                 setValue(
//                   "quoteNegotiable",
//                   watch("quoteNegotiable") == "Y" ? null : "Y"
//                 );
//               }}
//             />

//             <FormCheckbox
//               label="Value Negotiable"
//               checked={watch("valueNegotiable") == "Y"}
//               onCheckedChange={() => {
//                 setValue(
//                   "valueNegotiable",
//                   watch("valueNegotiable") == "Y" ? null : "Y"
//                 );
//               }}
//             />

//             <InputField
//               id="minimumvalue"
//               label="Minimum Value (Crores)"
//               placeholder="Enter min value"
//               type="number"
//               value={watch("minFillValue")?.toString() || ""}
//               onChangeAction={(e) =>
//                 setValue("minFillValue", Number(e) || undefined)
//               }
//               error={errors.minFillValue?.message}
//             />

//             <InputField
//               id="valuestepsize"
//               label="Value Step Size"
//               placeholder="Enter step size"
//               type="number"
//               value={watch("valueStepSize")?.toString() || ""}
//               onChangeAction={(e) =>
//                 setValue("valueStepSize", Number(e) || undefined)
//               }
//               error={errors.valueStepSize?.message}
//             />

//             <SelectField
//               label="Access Type"
//               placeholder="Select Access Type"
//               options={[
//                 { label: "OTM (One to many)", value: "1" },
//                 { label: "OTO (One to One)", value: "2" },
//                 { label: "IST (Inter scheme transfer)", value: "3" },
//               ]}
//               value={watch("access") || ""}
//               required
//               onChangeAction={(e) =>
//                 setValue("access", e as SchemaType["access"])
//               }
//               error={errors.access?.message}
//             />

//             <FormCheckbox
//               label="Anonymous"
//               checked={watch("anonymous") == "Y"}
//               onCheckedChange={() => {
//                 setValue("anonymous", watch("anonymous") == "Y" ? null : "Y");
//               }}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Additional Options</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="gap-4 grid md:grid-cols-3">
//             <InputField
//               id="participantlist"
//               label="Participant List"
//               placeholder="Enter Participant List"
//               type="text"
//               value={watch("participantList")?.join(", ") || ""}
//               onChangeAction={(e) =>
//                 setValue(
//                   "participantList",
//                   e ? e.split(",").map((s) => s.trim()) : undefined
//                 )
//               }
//               error={errors.participantList?.message}
//             />

//             <SelectField
//               label="Category"
//               placeholder="Select Category"
//               options={SECTORS.map((s) => ({
//                 label: s.description,
//                 value: s.code,
//               }))}
//               value={watch("category") || ""}
//               onChangeAction={(e) =>
//                 setValue("category", e as SchemaType["category"])
//               }
//               error={errors.category?.message}
//             />

//             <SelectField
//               label="Rating"
//               placeholder="Select Rating"
//               options={RATINGS.map((r) => ({
//                 label: r.description,
//                 value: r.code,
//               }))}
//               value={watch("rating") || ""}
//               onChangeAction={(e) =>
//                 setValue("rating", e as SchemaType["rating"])
//               }
//               error={errors.rating?.message}
//             />

//             <div className="flex flex-col gap-1 md:col-span-3">
//               <Label htmlFor="remarks">Remarks</Label>
//               <Textarea
//                 id="remarks"
//                 placeholder="Enter Remarks"
//                 value={watch("remarks") || ""}
//                 onChange={(e) => setValue("remarks", e.target.value)}
//               />
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter className="gap-5">
//           <Button variant={`secondary`}>Cancel</Button>
//           <Button onClick={handleSubmit(onSubmit)}>Submit RFQ</Button>
//         </CardFooter>
//       </Card>
//     </Form>
//   );
// }

// export default MyFOrmPage;

import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page