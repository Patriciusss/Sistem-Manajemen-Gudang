import Icon from "@/components/ui/Icon";

const FLOW = ["Pending", "Confirmed", "In Transit", "Inspecting", "Received"];

export default function Timeline({ status }) {
  const failed = status === "Rejected" || status === "Returned";
  const steps = status === "Rejected" ? ["Pending", "Rejected"] : status === "Returned" ? [...FLOW.slice(0, 4), "Returned"] : FLOW;
  const current = failed ? steps.length - 1 : FLOW.indexOf(status);
  const inset = `${50 / steps.length}%`;

  return (
    <ol className="relative grid text-center text-xs font-medium" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }} aria-label={`Order status: ${status}`}>
      <span aria-hidden="true" className="absolute top-3.5 h-1 rounded-full bg-ink/15" style={{ left: inset, right: inset }} />
      <span aria-hidden="true" className="absolute top-3.5 h-1" style={{ left: inset, right: inset }}>
        <span className={`grow block h-full w-full rounded-full ${failed ? "bg-red-600" : "bg-linear-to-r from-brand to-brand-sky"}`} style={{ "--to": current / (steps.length - 1) }} />
      </span>
      {steps.map((step, i) => (
        <li key={step} className="relative flex flex-col items-center gap-1.5">
          <span className={`grid h-7 w-7 place-items-center rounded-full text-white ${i > current ? "bg-ink-soft/40" : failed && i === current ? "bg-red-600" : "bg-brand"}`}>
            <Icon name={failed && i === current ? "x" : "check"} className="h-4 w-4" />
          </span>
          <span className={i === current ? "font-bold text-ink" : "text-ink-soft"}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
