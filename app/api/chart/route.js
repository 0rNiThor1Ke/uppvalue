export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const compare = searchParams.get("compare");
  if (!ticker) return Response.json({ error: "Missing ticker" }, { status: 400 });
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`;
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) return Response.json({ error: resp.status }, { status: resp.status });
    const data = await resp.json();
    const r = data?.chart?.result?.[0];
    if (!r) return Response.json({ error: "No data" }, { status: 404 });
    const ts = r.timestamp || [];
    const closes = r.indicators?.quote?.[0]?.close || [];
    const meta = r.meta;
    const chartData = ts.map((t, i) => ({ date: new Date(t * 1000).toISOString().split("T")[0], close: closes[i] })).filter(d => d.close != null);
    let comparison = null;
    if (compare) {
      try {
        const cResp = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(compare)}?interval=1d&range=1y`, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (cResp.ok) {
          const cData = await cResp.json();
          const cR = cData?.chart?.result?.[0];
          if (cR) {
            const cTs = cR.timestamp || [];
            const cCl = cR.indicators?.quote?.[0]?.close || [];
            const cChart = cTs.map((t, i) => ({ date: new Date(t * 1000).toISOString().split("T")[0], close: cCl[i] })).filter(d => d.close != null);
            if (chartData.length > 0 && cChart.length > 0) {
              const b1 = chartData[0].close, b2 = cChart[0].close;
              const map = {};
              chartData.forEach(d => { map[d.date] = { date: d.date, main: ((d.close - b1) / b1) * 100 }; });
              cChart.forEach(d => { if (map[d.date]) map[d.date].compare = ((d.close - b2) / b2) * 100; });
              comparison = Object.values(map).filter(d => d.main !== undefined && d.compare !== undefined).sort((a, b) => a.date.localeCompare(b.date));
            }
          }
        }
      } catch (e) {}
    }
    return Response.json({ ticker, name: meta.shortName || ticker, currency: meta.currency || "USD", price: meta.regularMarketPrice, chartData, returnPct: chartData.length > 1 ? ((chartData[chartData.length - 1].close - chartData[0].close) / chartData[0].close) * 100 : null, comparison, compareTicker: compare });
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }); }
}
