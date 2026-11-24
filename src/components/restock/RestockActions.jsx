import Link from "next/link";
import ActionForm from "@/components/ui/ActionForm";
import ReasonAction from "@/components/ui/ReasonAction";
import ImageField from "@/components/ui/ImageField";
import Textarea from "@/components/ui/Textarea";
import { btn } from "@/components/ui/styles";
import { changeRestockStatusAction, submitArrivalPhotoAction, submitInspectionReportAction } from "@/actions/restock";

const hidden = (id, status) => (
  <>
    <input type="hidden" name="id" value={id} />
    {status && <input type="hidden" name="status" value={status} />}
  </>
);

export default function RestockActions({ order, role, detail = false }) {
  const { id, status, po_number: po } = order;
  const open = (
    <Link href={`/${role}/restock/${id}`} className={btn.secondary}>
      Open order
    </Link>
  );

  if (role === "supplier" && status === "Pending") {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionForm action={changeRestockStatusAction} label="Confirm order" success={`${po} confirmed`} confirm={`Confirm that you can supply ${po}?`}>
          {hidden(id, "Confirmed")}
        </ActionForm>
        <ReasonAction action={changeRestockStatusAction} hidden={{ id, status: "Rejected" }} name="note" label="Reject" title={`Reject ${po}`} success={`${po} rejected`} />
      </div>
    );
  }
  if (role === "supplier" && status === "Confirmed") {
    return (
      <ActionForm action={changeRestockStatusAction} label="Mark in transit" success={`${po} is on its way`} confirm={`Mark ${po} as sent to the warehouse?`}>
        {hidden(id, "In Transit")}
      </ActionForm>
    );
  }
  if (role === "supplier" && status === "In Transit") {
    if (!detail) return open;
    return (
      <ActionForm action={submitArrivalPhotoAction} label="Save arrival photo" success="Arrival photo saved" className="max-w-md space-y-3">
        {hidden(id)}
        <ImageField label="Photo of the goods at the warehouse" name="arrival_photo" initial={order.arrival_photo ?? ""} />
      </ActionForm>
    );
  }
  if (role === "manager" && status === "In Transit") {
    if (!detail) return open;
    if (!order.arrival_photo) return <p className="text-sm text-ink-soft">Waiting for the supplier to upload the arrival photo.</p>;
    return (
      <ActionForm action={changeRestockStatusAction} label="Start inspection" success={`${po} is being inspected`} confirm={`Ask warehouse staff to inspect ${po}?`}>
        {hidden(id, "Inspecting")}
      </ActionForm>
    );
  }
  if (role === "manager" && status === "Inspecting") {
    return (
      <div className="space-y-2">
        <ReasonAction action={changeRestockStatusAction} hidden={{ id, status: "Returned" }} name="note" label="Return goods" title={`Return ${po}`} success={`${po} returned`} />
        <p className="text-sm text-ink-soft">To accept the goods, approve the incoming transaction made from this order.</p>
      </div>
    );
  }
  if (role === "staff" && status === "Inspecting") {
    if (!detail) return open;
    return (
      <div className="space-y-4">
        <ActionForm action={submitInspectionReportAction} label="Save inspection report" success="Inspection report saved" className="max-w-xl space-y-3">
          {hidden(id)}
          <Textarea label="Inspection report (quantity and condition)" name="inspection_report" rows={4} required defaultValue={order.inspection_report ?? ""} />
        </ActionForm>
        <Link href={`/staff/transactions/new?type=IN&po=${id}`} className={btn.primary}>
          Create incoming transaction
        </Link>
      </div>
    );
  }
  return null;
}
