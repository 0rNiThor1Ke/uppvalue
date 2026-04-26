import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "logos/" });
    const map = {};
    for (const b of blobs) {
      const fname = b.pathname.replace(/^logos\//, "");
      const ticker = fname.replace(/\.[a-z]+$/i, "");
      if (ticker) map[ticker] = b.url;
    }
    return new Response(JSON.stringify(map), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" }
    });
  } catch (e) {
    return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}
