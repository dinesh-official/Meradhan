"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, File, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  id?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Current file URL */
  value?: string;
  /** Callback when file is selected or URL is provided */
  onChangeAction?: (fileUrl: string) => void;
  /** When provided, file is uploaded immediately and onChangeAction receives the returned URL */
  onUpload?: (file: File) => Promise<string | null>;
  /** Optional container class */
  className?: string;
  error?: string;
  /** Accepted file types (e.g., "image/*", ".pdf,.jpg") */
  accept?: string;
}

export function FileUploadField({
  id,
  label,
  placeholder = "Select a file or enter URL",
  required = false,
  disabled = false,
  value,
  onChangeAction,
  onUpload,
  className,
  error,
  accept = "image/*,.pdf",
}: FileUploadFieldProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (onUpload && onChangeAction) {
      setUploading(true);
      try {
        const url = await onUpload(file);
        if (url) onChangeAction(url);
      } finally {
        setUploading(false);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (onChangeAction) {
      onChangeAction(objectUrl);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeAction) {
      onChangeAction(e.target.value);
      // Clear selected file when URL is manually entered
      if (e.target.value && !e.target.value.startsWith("blob:")) {
        setSelectedFile(null);
      }
    }
  };

  const handleClear = () => {
    if (onChangeAction) {
      onChangeAction("");
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Revoke object URL if it exists
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (value && value.startsWith("blob:")) {
        URL.revokeObjectURL(value);
      }
    };
  }, [value]);

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="mt-2 space-y-2">
        {/* File Input Button */}
        <div className="flex gap-2 items-center">
          <Input
            ref={fileInputRef}
            id={`${id}-file`}
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Select File"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {selectedFile && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <File className="h-4 w-4" />
              {selectedFile.name}
            </span>
          )}
        </div>

        {/* URL Input (for manual entry or after upload) */}
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value || ""}
          onChange={handleUrlChange}
          className={cn(
            "disabled:bg-gray-200 disabled:opacity-100 disabled:border-0 disabled:text-black"
          )}
        />

        {/* File Info */}
        {value && (
          <div className="mt-2 p-2 bg-muted rounded-md flex items-center gap-2 text-sm">
            {value.startsWith("blob:") ? (
              <>
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  File selected: {selectedFile?.name || "Preview"}
                </span>
                {!onUpload && (
                  <span className="text-xs text-yellow-600 ml-auto">
                    (Upload file to get permanent URL)
                  </span>
                )}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground truncate">{value}</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-destructive text-xs text-left">{error}</p>
      )}
    </div>
  );
}

