import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

// Plugins
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

interface RenderPdfProps {
  file: string; // URL or base64 string
  height?: number; // Optional height prop
  width?: number; // Optional width prop
}

const RenderPdf: React.FC<RenderPdfProps> = ({ file, height, width }) => {
  const zoomPluginInstance = zoomPlugin();
  const toolbarPluginInstance = toolbarPlugin();

  const { Toolbar } = toolbarPluginInstance;

  return (
    <div
      className="d-flex flex-column align-items-center bg-light border border-gray-200 rounded-3 overflow-hidden"
      style={{ width: width || "100%", height: height || "200px" }}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Toolbar />
        {/* PDF Viewer */}
        <Viewer
          fileUrl={file}
          plugins={[zoomPluginInstance, toolbarPluginInstance]}
        />
      </Worker>
    </div>
  );
};

export default RenderPdf;
