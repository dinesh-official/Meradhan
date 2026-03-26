"use client";

import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { useUploadFileToS3 } from "../../_hooks/useUploadFileToS3";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step10FileAttachmentsProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step10FileAttachments({ formHook }: Step10FileAttachmentsProps) {
  const { formData, updateStepData, getFieldError } = formHook;
  const { uploadFile } = useUploadFileToS3();

  const attachments = formData.step10?.attachments || [];

  const addAttachment = () => {
    const newAttachment = {
      fileName: "",
      fileUrl: "",
      fileType: "",
      description: "",
    };
    updateStepData("step10", {
      attachments: [...attachments, newAttachment],
    });
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    updateStepData("step10", {
      attachments: updatedAttachments,
    });
  };

  const updateAttachment = (index: number, field: string, value: string) => {
    const updatedAttachments = attachments.map((att, i) =>
      i === index ? { ...att, [field]: value } : att
    );
    updateStepData("step10", {
      attachments: updatedAttachments,
    });
  };

  const handleFileChange = (index: number, fileUrl: string) => {
    // Extract file name from base64 data URL or URL
    let fileName = "";
    let fileType = "";

    if (fileUrl.startsWith("data:")) {
      const matches = fileUrl.match(/data:([^;]+);base64,/);
      if (matches) {
        fileType = matches[1];
        // Try to extract filename from content-disposition or use default
        fileName = `attachment-${index + 1}.${fileType.split("/")[1] || "file"}`;
      }
    } else if (fileUrl) {
      // If it's a URL, extract filename from URL
      const urlParts = fileUrl.split("/");
      fileName = urlParts[urlParts.length - 1] || `attachment-${index + 1}`;
      // Try to determine file type from extension
      const extension = fileName.split(".").pop()?.toLowerCase() || "";
      if (["pdf", "jpg", "jpeg", "png", "gif"].includes(extension)) {
        fileType = extension === "pdf" ? "application/pdf" : `image/${extension === "jpg" ? "jpeg" : extension}`;
      }
    }

    updateAttachment(index, "fileUrl", fileUrl);
    if (fileName) {
      updateAttachment(index, "fileName", fileName);
    }
    if (fileType) {
      updateAttachment(index, "fileType", fileType);
    }
  };

  const handleESignFileChange = (fileUrl: string) => {
    updateStepData("step10", {
      eSignDocument: fileUrl,
    });
  };

  return (
    <div className="space-y-6">
      {/* E-Sign Document Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">E-Sign Document</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload the e-sign document (required)
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <FileUploadField
              id="eSignDocument"
              label="E-Sign Document"
              required
              value={formData.step10?.eSignDocument || ""}
              onChangeAction={handleESignFileChange}
              onUpload={(file) => uploadFile(file, "kyc")}
              error={getFieldError(10, "eSignDocument")}
              accept="image/*,application/pdf"
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Attachments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Additional File Attachments</h3>
            <p className="text-sm text-muted-foreground">
              Upload any additional supporting documents (optional)
            </p>
          </div>
          <Button type="button" onClick={addAttachment} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add File
          </Button>
        </div>

        {attachments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No attachments added yet. Click &quot;Add File&quot; to upload documents.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attachments.map((attachment, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Attachment {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <FileUploadField
                    id={`attachment-file-${index}`}
                    label="File"
                    required
                    value={attachment.fileUrl}
                    onChangeAction={(e) => handleFileChange(index, e)}
                    onUpload={(file) => uploadFile(file, "kyc")}
                    error={getFieldError(10, `attachments.${index}.fileUrl`)}
                    accept="image/*,application/pdf"
                  />

                  <InputField
                    id={`attachment-filename-${index}`}
                    label="File Name"
                    required
                    value={attachment.fileName}
                    onChangeAction={(e) => updateAttachment(index, "fileName", e)}
                    error={getFieldError(10, `attachments.${index}.fileName`)}
                  />

                  <InputField
                    id={`attachment-description-${index}`}
                    label="Description (Optional)"
                    value={attachment.description || ""}
                    onChangeAction={(e) => updateAttachment(index, "description", e)}
                    error={getFieldError(10, `attachments.${index}.description`)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

