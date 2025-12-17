"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
"use client";
import dynamic from "next/dynamic";

// Dynamically import ReactJson to avoid SSR issues
const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});
import { Root } from "./CheckedCompances";
function ShowResponseJson({ data }: { data?: Root }) {


  return <Card>
    <CardHeader>
      <CardTitle className="text-sm" >Response JSON</CardTitle>
    </CardHeader>
    <CardContent>
      <ReactJson src={(data?.step_1.pan?.response) || {}} collapsed />

    </CardContent>
  </Card>;
}

export default ShowResponseJson;
