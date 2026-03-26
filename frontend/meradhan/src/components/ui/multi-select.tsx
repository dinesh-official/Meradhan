"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { Checkbox } from "./checkbox";

type MultiSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, ReactNode>;
  onItemAdded: (value: string, label: ReactNode) => void;
};
const MultiSelectContext = createContext<MultiSelectContextType | null>(null);

export function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
}: {
  children: ReactNode;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [internalValues, setInternalValues] = useState(
    new Set<string>(values ?? defaultValues)
  );
  const selectedValues = values ? new Set(values) : internalValues;
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

  function toggleValue(value: string) {
    const getNewSet = (prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };
    setInternalValues(getNewSet);
    onValuesChange?.([...getNewSet(selectedValues)]);
  }

  const onItemAdded = useCallback((value: string, label: ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev;
      return new Map(prev).set(value, label);
    });
  }, []);

  return (
    <MultiSelectContext
      value={{
        open,
        setOpen,
        selectedValues,
        toggleValue,
        items,
        onItemAdded,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        {children}
      </Popover>
    </MultiSelectContext>
  );
}

export function MultiSelectTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext();

  return (
    <PopoverTrigger asChild>
      <Button
        {...props}
        variant={props.variant ?? "outline"}
        role={props.role ?? "combobox"}
        aria-expanded={props["aria-expanded"] ?? open}
        className={cn(
          "flex h-auto min-h-9 w-fit items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-white hover:bg-white hover:text-gray-600 px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
          className
        )}
      >
        {children}
        <IoChevronDownOutline className="opacity-50 size-4 shrink-0" />
      </Button>
    </PopoverTrigger>
  );
}

export function MultiSelectValue({
  placeholder,
  className,
  ...props
}: {
  placeholder?: string;
  clickToRemove?: boolean;
  overflowBehavior?: "wrap" | "wrap-when-open" | "cutoff";
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const { selectedValues, items } = useMultiSelectContext();

  if (selectedValues.size === 0 && placeholder) {
    return (
      <span className="min-w-0 overflow-hidden font-normal text-muted-foreground">
        {placeholder}
      </span>
    );
  }

  return (
    <div
      {...props}
      className={cn("flex gap-1.5 w-fit overflow-hidden", className)}
    >
      {items.get([...selectedValues].find((value) => items.has(value)) ?? "")}
      <p
        style={{
          display:
            [...selectedValues].filter((value) => items.has(value)).length > 1
              ? "block"
              : "none",
        }}
      >
        +{[...selectedValues].filter((value) => items.has(value)).length - 1}
      </p>
    </div>
  );
}

export function MultiSelectContent({
  children,
  ...props
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string };
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Command>, "children">) {
  return (
    <>
      <div style={{ display: "none" }} className="bg-secondary">
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent
        className="bg-secondary p-0 scrollbar-hide"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command {...props}>
          <CommandList>{children}</CommandList>
        </Command>
      </PopoverContent>
    </>
  );
}

export function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}: {
  badgeLabel?: ReactNode;
  value: string;
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext();
  const isSelected = selectedValues.has(value);

  useEffect(() => {
    onItemAdded(value, badgeLabel ?? children);
  }, [value, children, onItemAdded, badgeLabel]);

  return (
    <CommandItem
      {...props}
      onSelect={() => {
        toggleValue(value);
        onSelect?.(value);
      }}
    >
      <Checkbox
        checked={isSelected}
        checkClass="text-secondary"
        className={cn(
          "bg-white data-[state=checked]:bg-white mr-2 border-0 size-4 data-[state=checked]:text-secondary"
        )}
      />
      {children}
    </CommandItem>
  );
}

export function MultiSelectGroup(
  props: ComponentPropsWithoutRef<typeof CommandGroup>
) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(
  props: ComponentPropsWithoutRef<typeof CommandSeparator>
) {
  return <CommandSeparator {...props} />;
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext);
  if (context == null) {
    throw new Error(
      "useMultiSelectContext must be used within a MultiSelectContext"
    );
  }
  return context;
}
