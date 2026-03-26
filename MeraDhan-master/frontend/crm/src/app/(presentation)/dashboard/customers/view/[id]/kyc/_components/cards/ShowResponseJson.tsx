"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import ReactJson to avoid SSR issues
import { JsonView, defaultStyles } from 'react-json-view-lite';

import { Root } from "./CheckedCompances";
function ShowResponseJson({ data }: { data?: Root }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Response JSON</CardTitle>
      </CardHeader>
      <CardContent>
        <JsonView data={data?.step_1.pan?.response || {}}
          style={defaultStyles}
        />
      </CardContent>
    </Card>
  );
}

export default ShowResponseJson;
