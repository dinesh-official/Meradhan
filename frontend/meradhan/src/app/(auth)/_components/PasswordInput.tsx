import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

function PasswordInput({
  className,
  showPrefix = true,
  ...props
}: React.ComponentProps<"input"> & { showPrefix?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        className={cn(
          "peer bg-muted py-5 ps-12 pe-12 border-none placeholder:text-[#7fabd2]",
          !showPrefix && "ps-4",
          className
        )}
        {...props}
        type={show ? "text" : "password"}
      />
      <div
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 pe-5 text-muted-foreground/80 cursor-pointer end-0"
      >
        {show ? (
          <FaEyeSlash size={18} aria-hidden="true" />
        ) : (
          <FaEye size={18} aria-hidden="true" />
        )}
      </div>
      {showPrefix && (
        <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-4 text-[#7fabd2] pointer-events-none start-0">
          <FaLock size={16} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
