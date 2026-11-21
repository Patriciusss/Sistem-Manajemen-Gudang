import { authorize } from "@/lib/session";
import { reviewSupplier } from "@/lib/suppliers";
import { notFound, parseId, respond, serverError } from "@/lib/api";

export async function PATCH(request, { params }) {
  const { error } = await authorize(["admin"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  const body = await request.json().catch(() => ({}));
  try {
    return respond(await reviewSupplier(id, body.status));
  } catch (e) {
    return serverError(e);
  }
}
