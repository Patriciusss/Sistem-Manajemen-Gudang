const styles = {
  Pending: "bg-tone-amber",
  Approved: "bg-tone-green",
  Received: "bg-tone-green",
  Rejected: "bg-tone-red",
  Confirmed: "bg-tone-sky",
  "In Transit": "bg-tone-cyan",
  Inspecting: "bg-tone-orange",
  Returned: "bg-tone-red",
  Shipped: "bg-tone-aqua",
};

export default function StatusBadge({ status }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-ink ${styles[status]}`}>{status}</span>;
}
