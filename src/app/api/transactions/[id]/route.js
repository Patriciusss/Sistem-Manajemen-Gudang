import { authorize } from "@/lib/session";
import { changeTransactionStatus, deleteTransaction, getTransaction, updateTransaction } from "@/lib/transactions";
import { notFound, parseId, respond, serverError } from "@/lib/api";

async function handle(roles, request, params, run) {
  const { user, error } = await authorize(roles);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  try {
    return respond(await run(user, id, request ? await request.json().catch(() => ({})) : null));
  } catch (e) {
    return serverError(e);
  }
}

export const GET = (_request, { params }) => handle(["admin", "manager", "staff"], null, params, (_user, id) => getTransaction(id));

export const PUT = (request, { params }) => handle(["manager", "staff"], request, params, (user, id, body) => updateTransaction(user, id, body));

export const PATCH = (request, { params }) =>
  handle(["manager", "staff"], request, params, (user, id, body) => changeTransactionStatus(user, id, body.status, body.reason));

export const DELETE = (_request, { params }) => handle(["manager", "staff"], null, params, (user, id) => deleteTransaction(user, id));
