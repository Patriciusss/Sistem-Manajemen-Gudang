import { authorize } from "@/lib/session";
import { getRestock, updateRestock } from "@/lib/restock";
import { notFound, parseId, respond, serverError } from "@/lib/api";

export async function GET(_request, { params }) {
  const { user, error } = await authorize(["manager", "supplier", "staff"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  try {
    return respond(await getRestock(user, id));
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(request, { params }) {
  const { user, error } = await authorize(["manager", "supplier", "staff"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  const body = await request.json().catch(() => ({}));
  try {
    return respond(await updateRestock(user, id, body));
  } catch (e) {
    return serverError(e);
  }
}
