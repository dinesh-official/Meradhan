"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { CorporateKycData } from "../_utils/mapToPdfPayload";

type Props = {
  value: CorporateKycData;
  onChange: (next: CorporateKycData) => void;
  disabled?: boolean;
};

export default function DocumentsTab({ value, onChange, disabled }: Props) {
  const urls = value.pdfDocumentsUrls ?? [];
  const update = (next: string[]) => onChange({ ...value, pdfDocumentsUrls: next });
  const add = () => update([...urls, ""]);
  const remove = (idx: number) => update(urls.filter((_, i) => i !== idx));
  const set = (idx: number, v: string) => {
    const next = [...urls];
    next[idx] = v;
    update(next);
  };

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
        <div>
          <CardTitle className="text-sm">Attached document URLs ({urls.length})</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            PDF paths sent to the generation service as <code className="rounded bg-muted px-1 py-0.5">pdfDocumentsUrls</code>.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={add}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-4">
        {urls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No document URLs yet.</p>
        ) : (
          <div className="space-y-2">
            {urls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
                  {idx + 1}.
                </span>
                <Input
                  value={url}
                  onChange={(e) => set(idx, e.target.value)}
                  placeholder="https://..."
                  disabled={disabled}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => remove(idx)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
