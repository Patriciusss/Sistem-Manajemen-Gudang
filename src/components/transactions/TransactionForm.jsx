"use client";

import { useState } from "react";
import ActionForm from "@/components/ui/ActionForm";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ItemRows from "@/components/ui/ItemRows";
import { createTransactionAction } from "@/actions/transactions";

export default function TransactionForm({ type, products, suppliers = [], pos = [], today, poId = "", redirectTo, cancelHref, className = "" }) {
  const [po, setPo] = useState(poId);
  const [version, setVersion] = useState(0);
  const chosen = pos.find((p) => String(p.id) === po);

  return (
    <ActionForm
      action={createTransactionAction}
      label="Create transaction"
      success="Transaction created"
      redirectTo={redirectTo}
      cancelHref={cancelHref}
      onDone={() => {
        setPo("");
        setVersion(version + 1);
      }}
      className={`space-y-4 ${className}`}
    >
      <input type="hidden" name="type" value={type} />
      <Input label={type === "IN" ? "Received date" : "Shipping date"} name="trx_date" type="date" defaultValue={today} required />
      {type === "IN" && (
        <>
          <Select label="Purchase order (optional)" name="restock_order_id" value={po} onChange={(e) => setPo(e.target.value)}>
            <option value="">No PO</option>
            {pos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.po_number} - {p.supplier_name}
              </option>
            ))}
          </Select>
          {!chosen && (
            <Select label="Supplier" name="supplier_id" defaultValue="" required>
              <option value="" disabled>
                Select supplier
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
        </>
      )}
      {type === "OUT" && <Input label="Customer / destination" name="customer_name" maxLength={150} required />}
      {chosen ? (
        <p className="rounded-xl bg-white/60 px-3 py-2 text-sm">
          Supplier and products come from {chosen.po_number}: {chosen.items_summary}
        </p>
      ) : (
        <ItemRows key={version} products={products} />
      )}
      <Textarea label="Notes (optional)" name="notes" rows={3} />
    </ActionForm>
  );
}
