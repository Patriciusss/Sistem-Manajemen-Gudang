import ActionForm from "@/components/ui/ActionForm";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageField from "@/components/ui/ImageField";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories";

export default function CategoryForm({ category, backHref }) {
  return (
    <ActionForm
      action={category ? updateCategoryAction : createCategoryAction}
      label={category ? "Save changes" : "Create category"}
      success={category ? "Category updated" : "Category created"}
      redirectTo={backHref}
      cancelHref={backHref}
      className="glass-strong max-w-xl space-y-4 p-4 sm:p-6"
    >
      {category && <input type="hidden" name="id" value={category.id} />}
      <Input label="Name" name="name" defaultValue={category?.name ?? ""} maxLength={100} required />
      <Textarea label="Description" name="description" defaultValue={category?.description ?? ""} />
      <ImageField label="Image (optional)" initial={category?.image ?? ""} />
    </ActionForm>
  );
}
