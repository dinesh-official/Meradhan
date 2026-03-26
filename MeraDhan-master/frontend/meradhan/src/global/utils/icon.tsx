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
    pdf: <FaFilePdf size={20} color="#EF4822" />,
    doc: <BiSolidFileDoc size={20} color="#EF4822" />,
    docx: <BiSolidFileDoc size={20} color="#EF4822" />,
    xls: <FaFileExcel size={20} color="#EF4822" />,
    xlsx: <FaFileExcel size={20} color="#EF4822" />,
    ppt: <FaFilePowerpoint size={20} color="#EF4822" />,
    pptx: <FaFilePowerpoint size={20} color="#EF4822" />,
    zip: <FaFileZipper size={20} color="#EF4822" />,
    rar: <FaFileZipper size={20} color="#EF4822" />,
    mp3: <FaFileAudio size={20} color="#EF4822" />,
    mp4: <FaFileVideo size={20} color="#EF4822" />,
    mov: <FaFileVideo size={20} color="#EF4822" />,
    avi: <FaFileVideo size={20} color="#EF4822" />,
    wmv: <FaFileVideo size={20} color="#EF4822" />,
    flv: <FaFileVideo size={20} color="#EF4822" />,
    gif: <FaFileVideo size={20} color="#EF4822" />,
    jpg: <FaFileImage size={20} color="#EF4822" />,
    jpeg: <FaFileImage size={20} color="#EF4822" />,
    png: <FaFileImage size={20} color="#EF4822" />,
    bmp: <FaFileImage size={20} color="#EF4822" />,
    csv: <FaFileCsv size={20} color="#EF4822" />,
  };

  return (
    fileData[fileType.toLowerCase() as keyof typeof fileData] || <FaFile />
  );
};
