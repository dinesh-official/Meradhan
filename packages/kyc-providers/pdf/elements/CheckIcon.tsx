import { Path, Rect, Svg } from '@react-pdf/renderer'
import React from 'react'

function Checkbox({
  checked = false,
  size = 13,
  color = '#000000',
  radius = 2 // controls corner roundness
}) {
  const strokeWidth = size * 0.11

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {checked ? (
        <>
          {/* Filled rounded square */}
          <Rect
            x="0"
            y="0"
            width={size}
            height={size}
            rx={radius}
            ry={radius}
            fill={color}
          />
          {/* Checkmark (scaled) */}
          <Path
            d={`
              M ${size * 0.25} ${size * 0.55}
              L ${size * 0.45} ${size * 0.72}
              L ${size * 0.75} ${size * 0.28}
            `}
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        /* Empty rounded square */
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={size - strokeWidth}
          height={size - strokeWidth}
          rx={radius}
          ry={radius}
          stroke={color}
          strokeOpacity="0.6"
          strokeWidth={strokeWidth}
          fill="none"
        />
      )}
    </Svg>
  )
}

export default Checkbox


export const CheckOnlyIcon = ({ size = 13, color = '#000000' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >

      <Path
        d={`M ${size * 0.25} ${size * 0.55} L ${size * 0.45} ${size * 0.72} L ${size * 0.75} ${size * 0.28}`}
        stroke={color}
        strokeWidth={size * 0.11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}