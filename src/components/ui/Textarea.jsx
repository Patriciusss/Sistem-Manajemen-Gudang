import { inputClass } from "@/components/ui/styles";

export default function Textarea({ label, name, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <textarea id={name} name={name} rows={4} className={`${inputClass} h-auto py-2`} {...props} />
    </div>
  );
}
