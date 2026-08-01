'use client';

import toast from 'react-hot-toast';
import { FaCopy } from 'react-icons/fa6';

const CopyIsin = ({ isin }: { isin: string }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <button
      type="button"
      aria-label={`Copy ISIN ${isin}`}
      className="bg-transparent border-0 p-0 m-0"
      onClick={() => copyToClipboard(isin)}
    >
      <FaCopy
        size={14}
        aria-hidden="true"
        className="text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
      />
    </button>
  );
};

export default CopyIsin;
