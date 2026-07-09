// components/ComparisonRow.tsx
import React from 'react';
import { BsInfoCircleFill } from 'react-icons/bs';

type ComparisonRowProps = {
  label?: string;
  infoIcon?: boolean;
  values: React.ReactNode[];
  borderTop?: boolean;
};

const ComparisonRow = ({ label, values, borderTop = false, infoIcon = false }: ComparisonRowProps) => {
  return (
    <div className={`w-full flex h-full ${borderTop ? 'border-t' : ''}`}>
      <div className='flex justify-between items-center p-3 w-2/12'>
        {label && (
          <p className='text-gray-700 text-sm'>
            {label} {infoIcon && <BsInfoCircleFill size={14} color='#AAAAAA' />}
          </p>
        )}
      </div>
      {values.map((val, i) => (
        <div key={i} className='flex flex-1 justify-between items-center gap-2 p-3'>
          {val}
        </div>
      ))}
    </div>
  );
};

export default ComparisonRow;
