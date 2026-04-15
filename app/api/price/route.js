export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  if (!ticker) return Response.json({ error: "Missing ticker" }, { status: 400 });
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) return Response.json({ error: resp.status }, { status: resp.status });
    const data = await resp.json();
    const r = data?.chart?.result?.[0];
    if (!r) return Response.json({ error: "No data" }, { status: 404 });
    const m = r.meta;
    const prev = m.chartPreviousClose || m.regularMarketPrice;
    return Response.json({
      ticker, price: m.regularMarketPrice, previousClose: prev,
      changePct: prev ? ((m.regularMarketPrice - prev) / prev) * 100 : 0,
      currency: m.currency || "USD", name: m.shortName || ticker,
    });
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }); }
}
