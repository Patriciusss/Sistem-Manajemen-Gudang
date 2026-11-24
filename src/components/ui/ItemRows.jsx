"use client";

import { useState } from "react";
import { btn, inputClass } from "@/components/ui/styles";

const blank = { product_id: "", quantity: 1 };

export default function ItemRows({ products, initial = [] }) {
  const [rows, setRows] = useState(initial.length ? initial : [blank]);
  const update = (index, key, value) => setRows(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-medium">Products</legend>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_6rem_auto] items-center gap-2">
          <select name="product_id" aria-label={`Product ${i + 1}`} required value={row.product_id} onChange={(e) => update(i, "product_id", e.target.value)} className={inputClass}>
            <option value="" disabled>
              Select product
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) - {p.stock} {p.unit}
              </option>
            ))}
          </select>
          <input name="quantity" type="number" min="1" step="1" required aria-label={`Quantity ${i + 1}`} placeholder="Qty" value={row.quantity} onChange={(e) => update(i, "quantity", e.target.value)} className={inputClass} />
          <button type="button" disabled={rows.length === 1} aria-label={`Remove product ${i + 1}`} onClick={() => setRows(rows.filter((_, n) => n !== i))} className={btn.secondary}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, blank])} className={btn.secondary}>
        Add product
      </button>
    </fieldset>
  );
}
