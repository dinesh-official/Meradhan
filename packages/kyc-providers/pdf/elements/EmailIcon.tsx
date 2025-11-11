import { Path, Svg } from '@react-pdf/renderer'
import React from 'react'

function EmailIcon({ size = 12, color = '#EF4822' }) {
  return (
    <Svg
      width={size}
      height={(size * 10) / 13} // keep original aspect ratio (13:10)
      viewBox="0 0 13 10"
      fill="none"
    >
      <Path
        d="M1.21875 0C0.545898 0 0 0.559896 0 1.25C0 1.64323 0.180273 2.01302 0.4875 2.25L6.0125 6.5C6.30195 6.72135 6.69805 6.72135 6.9875 6.5L12.5125 2.25C12.8197 2.01302 13 1.64323 13 1.25C13 0.559896 12.4541 0 11.7812 0H1.21875ZM0 2.91667V8.33333C0 9.2526 0.728711 10 1.625 10H11.375C12.2713 10 13 9.2526 13 8.33333V2.91667L7.475 7.16667C6.89609 7.61198 6.10391 7.61198 5.525 7.16667L0 2.91667Z"
        fill={color}
      />
    </Svg>
  )
}

export default EmailIcon
