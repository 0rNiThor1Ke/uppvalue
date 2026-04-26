import { put, del, list } from "@vercel/blob";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function POST(req) {
  const session = await checkAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });
  try {
    const { ticker, dataUrl } = await req.json();
    if (!ticker || !dataUrl || !dataUrl.startsWith("data:image/")) {
      return new Response("Bad request", { status: 400 });
    }
    const safeTicker = String(ticker).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 32);
    if (!safeTicker) return new Response("Bad ticker", { status: 400 });
    const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!m) return new Response("Bad data URL", { status: 400 });
    const ext = m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase();
    const buffer = Buffer.from(m[2], "base64");
    if (buffer.length > 1024 * 1024) return new Response("Image too large", { status: 413 });
    try {
      const { blobs } = await list({ prefix: `logos/${safeTicker}.` });
      for (const b of blobs) await del(b.url);
    } catch (e) {}
    const result = await put(`logos/${safeTicker}.${ext}`, buffer, {
      access: "public",
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      addRandomSuffix: false,
      allowOverwrite: true
    });
    return new Response(JSON.stringify({ ticker: safeTicker, url: result.url }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await checkAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });
  try {
    const { ticker } = await req.json();
    if (!ticker) return new Response("Bad request", { status: 400 });
    const safeTicker = String(ticker).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 32);
    const { blobs } = await list({ prefix: `logos/${safeTicker}.` });
    for (const b of blobs) await del(b.url);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}
