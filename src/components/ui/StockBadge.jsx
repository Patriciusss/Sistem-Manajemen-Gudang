const styles = {
  "Out of Stock": "bg-stock-out text-white",
  Severe: "bg-stock-severe text-white",
  Low: "bg-stock-low text-foreground",
  Normal: "bg-stock-normal text-foreground",
};

export default function StockBadge({ status }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}
