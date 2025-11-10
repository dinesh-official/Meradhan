'use client';

import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa6';

const DeleteCompare = ({ index }: { index: number }) => {
  const params = useSearchParams();
  return (
    <FaTrash
      size={14}
      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
    />
  );
};

export default DeleteCompare;
