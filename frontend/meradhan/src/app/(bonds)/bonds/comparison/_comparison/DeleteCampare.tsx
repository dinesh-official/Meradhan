'use client';

import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa6';

const DeleteCompare = ({ index, bondName }: { index: number; bondName?: string }) => {
  const params = useSearchParams();
  return (
    <button
      type="button"
      aria-label={bondName ? `Remove ${bondName} from comparison` : 'Remove bond from comparison'}
      className="bg-transparent border-0 p-0 m-0"
      onClick={() => {
        const bonds = params.get('bonds');
        if (bonds) {
          const bondsArray = JSON.parse(bonds);
          if (bondsArray.length <= 2) {
            toast.error('at least 2 bonds to compare');
            return;
          }
          bondsArray.splice(index, 1);
          location.href = '/bonds/comparison?bonds=' + JSON.stringify(bondsArray);
        }
      }}
    >
      <FaTrash
        size={14}
        aria-hidden="true"
        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
      />
    </button>
  );
};

export default DeleteCompare;
