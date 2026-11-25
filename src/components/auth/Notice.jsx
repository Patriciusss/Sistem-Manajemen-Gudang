import Icon from "@/components/ui/Icon";

const TONES = {
  red: ["border-red-700 bg-tone-red/40", "alert"],
  amber: ["border-amber-700 bg-tone-amber/60", "clock"],
  green: ["border-green-700 bg-tone-green/40", "check"],
};

export default function Notice({ tone, title, children }) {
  const [style, icon] = TONES[tone];
  return (
    <div role={tone === "green" ? "status" : "alert"} className={`pop flex gap-3 rounded-xl border p-3 text-sm text-ink ${style}`}>
      <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{children}</p>
      </div>
    </div>
  );
}
