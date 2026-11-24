"use client";

import { useState } from "react";
import ActionForm from "@/components/ui/ActionForm";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { btn } from "@/components/ui/styles";

export default function ReasonAction({ action, hidden, name, label, title, success }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btn.danger}>
        {label}
      </button>
      {open && (
        <Modal title={title} onClose={() => setOpen(false)}>
          <ActionForm action={action} label={label} variant="danger" success={success} onDone={() => setOpen(false)}>
            {Object.entries(hidden).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
            <div className="mb-3">
              <Textarea label="Reason" name={name} required rows={3} />
            </div>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
