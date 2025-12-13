/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { CMS_URL } from "@/global/constants/domains";
import { API_KEY } from "@/core/connection/apollo-client";

const API_TOKEN = API_KEY;

// Download file from URL
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to download file: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Upload buffer to Strapi
async function uploadToStrapi(fileBuffer: Buffer, filename: string) {
  const form = new FormData();
  form.append("files", fileBuffer, {
    filename,
    contentType: "application/octet-stream",
  });
  form.append(
    "fileInfo",
    JSON.stringify({
      name: filename,
      alternativeText: filename,
      caption: "Automatic upload",
    })
  );

  const response = await axios.post(`${CMS_URL}/api/upload`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${API_TOKEN}` },
    maxBodyLength: Infinity,
  });

  return response.data;
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const { fileUrl, filename } = await req.json();

    if (!fileUrl || !filename) {
      return NextResponse.json(
        { error: "fileUrl and filename are required" },
        { status: 400 }
      );
    }

    const fileBuffer = await downloadFile(fileUrl);
    const result = await uploadToStrapi(fileBuffer, filename);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// OPTIONS handler for preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    { message: "CORS preflight" },
    {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
