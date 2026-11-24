import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listTransactions } from "@/lib/transactions";
import { transactionStatusCounts } from "@/lib/summary";
import { pick, withParams } from "@/lib/query";
import TransactionRow from "@/components/transactions/TransactionRow";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Stat from "@/components/ui/Stat";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import TabLinks from "@/components/ui/TabLinks";
import EmptyState from "@/components/ui/EmptyState";
import { btn, th } from "@/components/ui/styles";

const LIMIT = 10;
const STATUS_TILES = [
  ["Pending", "clock", "yellow"],
  ["Approved", "check", "green"],
  ["Rejected", "x", "red"],
  ["Shipped", "truck", "cyan"],
];
const SORTS = [
  ["newest", "Newest date"],
  ["oldest", "Oldest date"],
  ["quantity", "Most quantity"],
  ["status", "Status"],
];

export default async function TransactionsPage({ searchParams }) {
  const user = await requireUser(["admin", "manager", "staff"]);
  const query = await searchParams;
  const type = pick(query.type) === "OUT" ? "OUT" : "IN";
  const filters = { status: pick(query.status), date_from: pick(query.date_from), date_to: pick(query.date_to), party: pick(query.party), sort: pick(query.sort) };
  const page = Math.max(1, parseInt(pick(query.page)) || 1);
  const [{ data: transactions, total }, counts] = await Promise.all([listTransactions({ type, ...filters, page, limit: LIMIT }), transactionStatusCounts(type)]);
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const base = `/${user.role}/transactions`;
  const hrefFor = (over) => withParams({ type, ...filters, ...over });
  const tiles = type === "IN" ? STATUS_TILES.slice(0, 3) : STATUS_TILES;
  const incoming = type === "IN";

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Every incoming and outgoing movement of goods, with its approval status.">
        {user.role !== "admin" && (
          <Link href={`${base}/new?type=${type}`} className={btn.primary}>
            <Icon name="plus" />
            {incoming ? "New incoming" : "New outgoing"}
          </Link>
        )}
      </PageHeader>

      <TabLinks
        tabs={[
          { label: "Barang Masuk", href: withParams({ type: "IN" }), active: incoming },
          { label: "Barang Keluar", href: withParams({ type: "OUT" }), active: !incoming },
        ]}
      />

      <div className={`grid grid-cols-2 gap-3 ${incoming ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
        <Stat label="All" value={counts.total} icon="swap" tone="teal" href={hrefFor({ status: "" })} active={!filters.status} index={0} />
        {tiles.map(([status, icon, tone], i) => (
          <Stat key={status} label={status} value={counts[status]} icon={icon} tone={tone} href={hrefFor({ status })} active={filters.status === status} index={i + 1} />
        ))}
      </div>

      <form className="glass-strong grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_9rem_10rem_10rem_10rem_auto] lg:items-end">
        <input type="hidden" name="type" value={type} />
        <Input label={incoming ? "Supplier" : "Customer"} name="party" defaultValue={filters.party ?? ""} />
        <Select label="Status" name="status" defaultValue={filters.status ?? ""}>
          <option value="">All</option>
          {tiles.map(([s]) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Input label="From" name="date_from" type="date" defaultValue={filters.date_from ?? ""} />
        <Input label="To" name="date_to" type="date" defaultValue={filters.date_to ?? ""} />
        <Select label="Sort by" name="sort" defaultValue={filters.sort ?? "newest"}>
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <button className={btn.primary}>Apply</button>
      </form>

      <div className="glass-strong overflow-x-auto">
        <table className="w-full min-w-176 text-left text-sm">
          <thead>
            <tr>
              {["Number", "Date", incoming ? "Supplier" : "Customer", incoming ? "PO" : "Items", "Quantity", "Status"].map((h) => (
                <th key={h} scope="col" className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <TransactionRow key={t.id} t={t} incoming={incoming} base={base} />
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <EmptyState title="No transactions found" text="Adjust the filters or record a new one." href={user.role !== "admin" ? `${base}/new?type=${type}` : undefined} action="New transaction" />
        )}
      </div>

      <Pagination page={page} pages={pages} total={total} noun="transactions" hrefFor={(p) => hrefFor({ page: p })} />
    </div>
  );
}
