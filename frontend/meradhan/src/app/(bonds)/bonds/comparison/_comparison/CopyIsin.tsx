'use client';

import toast from 'react-hot-toast';
import { FaCopy } from 'react-icons/fa6';

const CopyIsin = ({ isin }: { isin: string }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <FaCopy 
      size={14} 
      className="text-blue-400 hover:text-blue-600 transition-colors cursor-pointer" 
      onClick={() => copyToClipboard(isin)} 
    />
  );
};

export default CopyIsin;
