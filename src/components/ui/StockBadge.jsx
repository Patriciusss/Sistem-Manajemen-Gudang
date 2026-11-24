const styles = {
  "Out of Stock": "bg-tone-gray",
  Severe: "bg-tone-red",
  Low: "bg-tone-yellow",
  Normal: "bg-tone-green",
};

export default function StockBadge({ status }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-ink ${styles[status]}`}>{status}</span>;
}
