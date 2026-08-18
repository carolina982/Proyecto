import crypto from "crypto";

type TicketRow = { userId: string; unitId: string; exp: number };

const TTL_MS = 15 * 60 * 1000;
const tickets = new Map<string, TicketRow>();

function prune(now = Date.now()) {
  for (const [k, row] of tickets) {
    if (row.exp <= now) tickets.delete(k);
  }
}

export function issueGpsShareTicket(userId: string, unitId: string) {
  prune();
  const ticket = crypto.randomBytes(24).toString("base64url");
  tickets.set(ticket, {
    userId: String(userId),
    unitId,
    exp: Date.now() + TTL_MS,
  });
  return { ticket, expiresInSec: Math.floor(TTL_MS / 1000) };
}

export function peekGpsShareTicket(ticket: string): TicketRow | null {
  prune();
  const row = tickets.get(String(ticket || "").trim());
  if (!row || row.exp <= Date.now()) return null;
  return row;
}
