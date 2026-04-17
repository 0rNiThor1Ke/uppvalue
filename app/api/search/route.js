export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q || q.length < 1) return Response.json({ results: [] });
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=fr-FR&region=FR&quotesCount=8&newsCount=0&listsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) return Response.json({ results: [] });
    const data = await resp.json();
    const quotes = (data.quotes || []).filter(q => q.quoteType === "EQUITY" || q.quoteType === "ETF" || q.quoteType === "CRYPTOCURRENCY" || q.quoteType === "MUTUALFUND" || q.quoteType === "INDEX").map(q => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: q.quoteType?.toLowerCase() || "stock",
      exchange: q.exchDisp || q.exchange || "",
    }));
    return Response.json({ results: quotes });
  } catch (err) { return Response.json({ results: [] }); }
}
