import type { RegulatoryInfoItem } from "@/types/contact";

interface RegulatoryInfoProps {
  items: readonly RegulatoryInfoItem[];
}

export function RegulatoryInfo({ items }: RegulatoryInfoProps) {
  return (
    <div className="mt-8 container">
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 py-5 border-gray-100 border-t border-b">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <p className="text-gray-500 text-sm">{item.label}</p>
            <p>
              {item.value}
              {item.description && (
                <>
                  <br />
                  <small>{item.description}</small>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}