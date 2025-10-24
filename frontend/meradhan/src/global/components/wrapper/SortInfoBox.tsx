export function SortInfoBox({
  children,
  title,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="odd:border even:bg-muted rounded-lg p-2.5 flex flex-col gap-[2px] text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-medium text-lg">{children}</p>
    </div>
  );
}