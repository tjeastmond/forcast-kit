import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { FILTER_CONTROL_HEIGHT_CLASS } from '@/lib/filterControls';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'border-input bg-background w-full rounded-lg border px-3 text-sm focus:border-blue-500 focus:outline-none',
        FILTER_CONTROL_HEIGHT_CLASS,
        className,
      )}
      {...props}
    />
  );
});

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'border-input bg-background w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-muted-foreground text-sm font-medium', className)} {...props} />;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onCheckedChange(event.target.checked);
        }}
        className="size-4 rounded border"
      />
      {label}
    </label>
  );
}
