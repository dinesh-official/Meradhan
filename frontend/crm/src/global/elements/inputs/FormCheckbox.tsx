import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface FormCheckboxProps {
  id?: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const FormCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
  required = false,
  className = "",
  disabled,
  error,
}: FormCheckboxProps) => {
  return (
    <div
      className={`flex items-start justify-start  flex-col gap-4  ${className}`}
    >
      <Label htmlFor={id}>
        {label} {required && <span className="text-gray-500 text-xs">(Mandatory)</span>}
      </Label>
      <div>
        <Switch
          id={id}
          disabled={disabled}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
};
