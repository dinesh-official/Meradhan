import { cn } from "@/lib/utils";
import { ImCheckboxChecked } from "react-icons/im";
import { IoIosInformationCircle } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";
function DataInfoLabel({
  title,
  children,
  showStatus,
  statusLabel,
  status,
  className,
  subtext,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  subtext?: React.ReactNode;

  showStatus?: boolean;
  status?: "ERROR" | "SUCCESS" | "WARNING";
  statusLabel?: React.ReactNode | string;
  className?: string;
}) {
  const getStatus = (status: "ERROR" | "SUCCESS" | "WARNING") => {
    switch (status) {
      case "ERROR":
        return <IoCloseCircle className="text-red-600" size={15} />;
      case "WARNING":
        return <IoIosInformationCircle className="text-yellow-600" size={15} />;
      case "SUCCESS":
      default:
        return <ImCheckboxChecked className="text-green-600" size={15} />;
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="flex items-center gap-2 font-normal text-gray-600 text-xs">
        {title}
        {showStatus && (
          <>
            {status && getStatus(status || "SUCCESS")}
            {statusLabel && <span>{statusLabel || "Verified"}</span>}
          </>
        )}
      </p>
      {subtext}

      {children}
    </div>
  );
}

export default DataInfoLabel;
