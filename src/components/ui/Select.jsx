import { inputClass } from "@/components/ui/styles";

export default function Select({ label, name, children, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select id={name} name={name} className={inputClass} {...props}>
        {children}
      </select>
    </div>
  );
}
