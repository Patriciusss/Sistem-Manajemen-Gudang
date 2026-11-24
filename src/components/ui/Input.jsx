import { inputClass } from "@/components/ui/styles";

export default function Input({ label, name, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input id={name} name={name} className={inputClass} {...props} />
    </div>
  );
}
