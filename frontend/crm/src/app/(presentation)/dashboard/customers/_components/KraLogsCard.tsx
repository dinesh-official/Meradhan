/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function toShortString(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string") return v.trim() === "" ? "—" : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") return "Object";
  return String(v);
}

function prettyJson(v: unknown): string {
  if (v == null) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function KeyValueView({
  value,
  depth = 0,
  maxDepth = 2,
}: {
  value: unknown;
  depth?: number;
  maxDepth?: number;
}) {
  if (value == null) {
    return <p className="p-3 text-xs text-muted-foreground">—</p>;
  }

  if (!isPlainObject(value) && !Array.isArray(value)) {
    return <p className="p-3 text-xs whitespace-pre-wrap">{toShortString(value)}</p>;
  }

  // Arrays: show indexed items (collapsed after maxDepth)
  if (Array.isArray(value)) {
    if (depth >= maxDepth) {
      return (
        <pre className="p-3 text-xs overflow-auto whitespace-pre-wrap">
          {prettyJson(value)}
        </pre>
      );
    }
    return (
      <div className="p-3 text-xs space-y-2">
        {value.length === 0 && (
          <p className="text-muted-foreground">Empty array</p>
        )}
        {value.map((item, idx) => (
          <details key={idx} className="rounded-md border bg-background">
            <summary className="cursor-pointer select-none px-2 py-1 text-muted-foreground">
              [{idx}] {toShortString(item)}
            </summary>
            <div className="border-t">
              <KeyValueView value={item} depth={depth + 1} maxDepth={maxDepth} />
            </div>
          </details>
        ))}
      </div>
    );
  }

  // Objects: show key/value rows; nested objects become expandable
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground">Empty object</p>;
  }

  return (
    <div className="p-3 text-xs space-y-1">
      {entries.map(([k, v]) => {
        const nested = isPlainObject(v) || Array.isArray(v);
        if (nested) {
          if (depth >= maxDepth) {
            return (
              <div key={k} className="grid grid-cols-12 gap-2 py-1">
                <div className="col-span-5 font-medium wrap-break-word">{k}</div>
                <div className="col-span-7 text-muted-foreground wrap-break-word">
                  {toShortString(v)}
                </div>
              </div>
            );
          }
          return (
            <details key={k} className="rounded-md border bg-background">
              <summary className="cursor-pointer select-none px-2 py-1">
                <span className="font-medium">{k}</span>{" "}
                <span className="text-muted-foreground">({toShortString(v)})</span>
              </summary>
              <div className="border-t">
                <KeyValueView value={v} depth={depth + 1} maxDepth={maxDepth} />
              </div>
            </details>
          );
        }

        return (
          <div key={k} className="grid grid-cols-12 gap-2 py-1">
            <div className="col-span-5 font-medium wrap-break-word">{k}</div>
            <div className="col-span-7 wrap-break-word whitespace-pre-wrap">
              {toShortString(v)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type KraLogRow = {
  id: number;
  stage: string;
  kycId: number;
  reqTime: unknown;
  requestData: unknown;
  responseData: unknown;
};

export function KraLogsCard({ logs }: { logs: KraLogRow[] | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">KRA Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {(!logs || logs.length === 0) && (
          <p className="text-muted-foreground text-xs">No KRA logs found.</p>
        )}

        {logs && logs.length > 0 && (
          <Accordion type="multiple" className="w-full">
            {logs
              .slice()
              .reverse()
              .slice(0, 80)
              .map((l) => {
                const ts = l.reqTime ? new Date(l.reqTime as any) : null;
                const timeText =
                  ts && !isNaN(ts.getTime()) ? ts.toLocaleString("en-IN") : "—";
                return (
                  <AccordionItem key={l.id} value={String(l.id)} className="border-b">
                    <AccordionTrigger className="py-3">
                      <div className="flex w-full flex-wrap gap-x-3 gap-y-1 items-center pr-2 text-xs">
                        <span className="font-medium">{l.stage}</span>
                        <span className="text-muted-foreground">{timeText}</span>
                        <span className="text-muted-foreground">KYC ID: {l.kycId}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-md border">
                          <div className="px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                            Request
                          </div>
                          <KeyValueView value={l.requestData} />
                        </div>
                        <div className="rounded-md border">
                          <div className="px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                            Response
                          </div>
                          <KeyValueView value={l.responseData} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

