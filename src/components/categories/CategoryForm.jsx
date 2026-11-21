import ActionForm from "@/components/ui/ActionForm";
import Field from "@/components/ui/Field";
import Textarea from "@/components/ui/Textarea";
import ImageField from "@/components/ui/ImageField";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories";

export default function CategoryForm({ category, backHref }) {
  return (
    <ActionForm
      action={category ? updateCategoryAction : createCategoryAction}
      label={category ? "Save changes" : "Create category"}
      redirectTo={backHref}
      cancelHref={backHref}
      className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      {category && <input type="hidden" name="id" value={category.id} />}
      <Field label="Name" name="name" defaultValue={category?.name ?? ""} maxLength={100} required />
      <Textarea label="Description" name="description" defaultValue={category?.description ?? ""} />
      <ImageField label="Image (optional)" initial={category?.image ?? ""} />
    </ActionForm>
  );
}
