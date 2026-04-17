const KNOWN={AMZN:"amazon.com",MSFT:"microsoft.com",AAPL:"apple.com",GOOGL:"google.com",GOOG:"google.com",META:"meta.com",NVDA:"nvidia.com",TSLA:"tesla.com","SU.PA":"se.com","AI.PA":"airliquide.com","MC.PA":"lvmh.com",SPGI:"spglobal.com",MA:"mastercard.com",FTNT:"fortinet.com",MELI:"mercadolibre.com",CCJ:"cameco.com",V:"visa.com",JPM:"jpmorganchase.com",NFLX:"netflix.com",COST:"costco.com",ADBE:"adobe.com",CRM:"salesforce.com",COIN:"coinbase.com",NET:"cloudflare.com",AMD:"amd.com",ASML:"asml.com",BKNG:"booking.com","RMS.PA":"hermes.com",FICO:"fico.com",NVO:"novonordisk.com","BTC-USD":"bitcoin.org","ETH-USD":"ethereum.org",AVGO:"broadcom.com",LLY:"lilly.com",UNH:"unitedhealthgroup.com",WMT:"walmart.com",PG:"pg.com",JNJ:"jnj.com",XOM:"exxonmobil.com",BAC:"bankofamerica.com",HD:"homedepot.com",KO:"coca-colacompany.com",PEP:"pepsico.com",MRK:"merck.com",ABBV:"abbvie.com",TMO:"thermofisher.com",CSCO:"cisco.com",ACN:"accenture.com",MCD:"mcdonalds.com",TXN:"ti.com",QCOM:"qualcomm.com",INTC:"intel.com",IBM:"ibm.com",GS:"goldmansachs.com",MS:"morganstanley.com",BLK:"blackrock.com",PYPL:"paypal.com",SHOP:"shopify.com",PLTR:"palantir.com",UBER:"uber.com",ABNB:"airbnb.com",PANW:"paloaltonetworks.com",CRWD:"crowdstrike.com",ZS:"zscaler.com",DDOG:"datadoghq.com",NOW:"servicenow.com",TEAM:"atlassian.com",SNPS:"synopsys.com",MU:"micron.com",BA:"boeing.com",LMT:"lockheedmartin.com",NKE:"nike.com",SBUX:"starbucks.com",DIS:"thewaltdisneycompany.com",TMUS:"t-mobile.com",VZ:"verizon.com",SPOT:"spotify.com","SOL-USD":"solana.com","XRP-USD":"ripple.com","OR.PA":"loreal.com","BNP.PA":"bnpparibas.com","AIR.PA":"airbus.com","TTE.PA":"totalenergies.com","KER.PA":"kering.com","CAP.PA":"capgemini.com","SAF.PA":"safran-group.com"};

const cache = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const t = searchParams.get("t");
  if (!t) return new Response("Missing ticker", { status: 400 });

  if (KNOWN[t]) {
    return Response.redirect(`https://icon.horse/icon/${KNOWN[t]}`, 302);
  }

  if (cache.has(t)) {
    const d = cache.get(t);
    if (d === null) return Response.json({ fallback: true }, { status: 404 });
    return Response.redirect(`https://icon.horse/icon/${d}`, 302);
  }

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(t)}?modules=assetProfile`;
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (resp.ok) {
      const data = await resp.json();
      const profile = data?.quoteSummary?.result?.[0]?.assetProfile;
      if (profile?.website) {
        const domain = profile.website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
        cache.set(t, domain);
        return Response.redirect(`https://icon.horse/icon/${domain}`, 302);
      }
    }

    const searchResp = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(t)}&quotesCount=1&newsCount=0`, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (searchResp.ok) {
      const sd = await searchResp.json();
      const name = sd?.quotes?.[0]?.shortname || sd?.quotes?.[0]?.longname || "";
      if (name) {
        const cleaned = name.replace(/,?\s*(Inc\.?|Corp\.?|Ltd\.?|S\.?A\.?|PLC|N\.?V\.?|SE|AG|Co\.?|Group|Holdings?|International|Technologies|Technology|Pharmaceuticals|Corporation)\s*/gi, "").trim();
        const guess = cleaned.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
        if (guess.length > 4) {
          cache.set(t, guess);
          return Response.redirect(`https://icon.horse/icon/${guess}`, 302);
        }
      }
    }

    cache.set(t, null);
    return Response.json({ fallback: true }, { status: 404 });
  } catch (err) {
    return Response.json({ fallback: true }, { status: 500 });
  }
}
