"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/components/ui/StatusBadge";
import { td, row, link } from "@/components/ui/styles";

export default function TransactionRow({ t, incoming, base }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  async function toggle() {
    setOpen(!open);
    if (detail || open) return;
    const res = await fetch(`/api/transactions/${t.id}`);
    const body = await res.json();
    if (res.ok) setDetail(body.data);
    else setError(body.message ?? "Could not load the details");
  }

  return (
    <>
      <tr className={`${row} cursor-pointer`} onClick={toggle}>
        <td className={`${td} font-mono text-xs`} data-label="Number">
          <div className="flex items-center gap-2">
            <button type="button" aria-expanded={open} aria-controls={`trx-${t.id}`} aria-label={`Show items of ${t.trx_number}`} onClick={(e) => { e.stopPropagation(); toggle(); }} className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl hover:bg-white/70">
              <Icon name="chevron" className={`h-5 w-5 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
            </button>
            <Link href={`${base}/${t.id}`} onClick={(e) => e.stopPropagation()} className={link}>
              {t.trx_number}
            </Link>
          </div>
        </td>
        <td className={td} data-label="Date">{t.trx_date}</td>
        <td className={td} data-label={incoming ? "Supplier" : "Customer"}>{incoming ? t.supplier_name : t.customer_name}</td>
        <td className={td} data-label={incoming ? "PO" : "Items"}>{incoming ? (t.po_number ?? "-") : `${t.item_count} products`}</td>
        <td className={`${td} tabular-nums`} data-label="Quantity">{t.total_quantity}</td>
        <td className={td} data-label="Status">
          <StatusBadge status={t.status} />
        </td>
      </tr>
      {open && (
        <tr id={`trx-${t.id}`} className="border-t border-ink/10 bg-white/50">
          <td colSpan={6} className="px-4 py-3">
            <div className="rise space-y-2 text-sm">
              {error && <p role="alert" className="font-medium text-red-700">{error}</p>}
              {!detail && !error && <p className="text-ink-soft">Loading...</p>}
              {detail && (
                <>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {detail.items.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{i.product_name}</span>
                          <span className="font-mono text-xs text-ink-soft">{i.product_sku}</span>
                        </span>
                        <span className="font-bold tabular-nums">x{i.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  {detail.notes && <p className="text-ink-soft">Notes: {detail.notes}</p>}
                  {detail.reject_reason && <p className="font-medium text-red-700">Rejected: {detail.reject_reason}</p>}
                  <Link href={`${base}/${t.id}`} className={`${link} inline-flex h-11 items-center`}>
                    Open full details
                  </Link>
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
