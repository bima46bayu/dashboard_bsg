import { cn } from "@/lib/cn";
import { inputBase } from "@/components/monitoring/FormField";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select one or more...",
  disabled,
  className,
}: Props) {
  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  if (options.length === 0) {
    return (
      <div
        className={cn(
          inputBase,
          "cursor-not-allowed text-ink-muted",
          className,
        )}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-h-36 overflow-y-auto rounded-lg border border-line bg-white p-2 shadow-sm",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-bg-muted"
        >
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            disabled={disabled}
            className="h-4 w-4 rounded border-line text-blue-600 focus:ring-blue-500/20"
          />
          <span className="text-ink">{opt.label}</span>
        </label>
      ))}
      {value.length === 0 && (
        <p className="px-2 py-1 text-xs text-ink-faint">{placeholder}</p>
      )}
    </div>
  );
}
