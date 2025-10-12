import { ChevronLeft } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React from "react";

function QuickBackBtn({
  title = "Go Back",
  onClick,
}: {
  title?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          router.back();
        }
      }}
      className="inline-flex items-center justify-center leading-0  font-medium gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
    >
      <ChevronLeft size={20} />
      {title}
    </button>
  );
}

export default QuickBackBtn;
