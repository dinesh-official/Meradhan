import React from 'react'
const data = {
    "R": "Retail – Unregistered",
    "I": "Institution - Regulated",
    "U": "Institution – Unregulated"
}
function RefqRegType({ type }: { type?: string }) {
    return (
        <p className="font-medium text-sm">{data[type as keyof typeof data] || "--"}</p>
    )
}

export default RefqRegType