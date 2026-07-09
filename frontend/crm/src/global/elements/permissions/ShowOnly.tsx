import React from 'react'

function ShowOnly({ children, condition }: { children: React.ReactNode, condition: boolean }) {
  return (
    <>{condition ? children : null}</>
  )
}

export default ShowOnly