export function SortInfoBox({
  children,
  title,
  hide,
}: {
  title?: string;
  children?: React.ReactNode;
  hide?: boolean;
}) {
  if (hide) return null;

  return (
    <div className="flex flex-col gap-[2px] even:bg-muted p-2.5 odd:border rounded-lg text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="flex justify-center items-center font-medium text-lg">
        {children}
      </p>
    </div>
  );
}
