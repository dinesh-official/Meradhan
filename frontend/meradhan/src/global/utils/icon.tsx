"use client";

import { BiSolidFileDoc } from "react-icons/bi";
import {
  FaFile,
  FaFileAudio,
  FaFileCsv,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileZipper,
} from "react-icons/fa6";

export const getFileIcon = (fileType: string) => {
  const fileData = {
    pdf: <FaFilePdf size={20} color="#EF4822" aria-hidden="true" />,
    doc: <BiSolidFileDoc size={20} color="#EF4822" aria-hidden="true" />,
    docx: <BiSolidFileDoc size={20} color="#EF4822" aria-hidden="true" />,
    xls: <FaFileExcel size={20} color="#EF4822" aria-hidden="true" />,
    xlsx: <FaFileExcel size={20} color="#EF4822" aria-hidden="true" />,
    ppt: <FaFilePowerpoint size={20} color="#EF4822" aria-hidden="true" />,
    pptx: <FaFilePowerpoint size={20} color="#EF4822" aria-hidden="true" />,
    zip: <FaFileZipper size={20} color="#EF4822" aria-hidden="true" />,
    rar: <FaFileZipper size={20} color="#EF4822" aria-hidden="true" />,
    mp3: <FaFileAudio size={20} color="#EF4822" aria-hidden="true" />,
    mp4: <FaFileVideo size={20} color="#EF4822" aria-hidden="true" />,
    mov: <FaFileVideo size={20} color="#EF4822" aria-hidden="true" />,
    avi: <FaFileVideo size={20} color="#EF4822" aria-hidden="true" />,
    wmv: <FaFileVideo size={20} color="#EF4822" aria-hidden="true" />,
    flv: <FaFileVideo size={20} color="#EF4822" aria-hidden="true" />,
    gif: <FaFileVideo size={20} color="#EF4822" aria-hidden="true" />,
    jpg: <FaFileImage size={20} color="#EF4822" aria-hidden="true" />,
    jpeg: <FaFileImage size={20} color="#EF4822" aria-hidden="true" />,
    png: <FaFileImage size={20} color="#EF4822" aria-hidden="true" />,
    bmp: <FaFileImage size={20} color="#EF4822" aria-hidden="true" />,
    csv: <FaFileCsv size={20} color="#EF4822" aria-hidden="true" />,
  };

  return (
    fileData[fileType.toLowerCase() as keyof typeof fileData] || (
      <FaFile aria-hidden="true" />
    )
  );
};
