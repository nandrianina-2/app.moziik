import { InputHTMLAttributes } from "react";

export function FormField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm text-ink-muted mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-base px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
      />
    </label>
  );
}
