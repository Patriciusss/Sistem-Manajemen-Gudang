import ActionForm from "@/components/ui/ActionForm";
import ReasonAction from "@/components/ui/ReasonAction";
import { changeTransactionStatusAction } from "@/actions/transactions";

export default function TransactionActions({ trx, role }) {
  if (role === "manager" && trx.status === "Pending") {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionForm action={changeTransactionStatusAction} label="Approve" success={`${trx.trx_number} approved`} confirm={trx.type === "IN" ? `Approve ${trx.trx_number}? Stock will increase and the PO will be marked Received.` : `Approve ${trx.trx_number}? The goods will be prepared. Stock is reduced when it is shipped.`}>
          <input type="hidden" name="id" value={trx.id} />
          <input type="hidden" name="status" value="Approved" />
        </ActionForm>
        <ReasonAction action={changeTransactionStatusAction} hidden={{ id: trx.id, status: "Rejected" }} name="reason" label="Reject" title={`Reject ${trx.trx_number}`} success={`${trx.trx_number} rejected`} />
      </div>
    );
  }
  if (role === "staff" && trx.type === "OUT" && trx.status === "Approved") {
    return (
      <ActionForm action={changeTransactionStatusAction} label="Mark shipped" success={`${trx.trx_number} marked as shipped`} confirm={`Mark ${trx.trx_number} as shipped? Stock will be reduced by the shipped quantities.`}>
        <input type="hidden" name="id" value={trx.id} />
        <input type="hidden" name="status" value="Shipped" />
      </ActionForm>
    );
  }
  return null;
}
