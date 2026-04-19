import "./globals.css";
import Providers from "./providers";
export const metadata = { title: "UppValue", description: "Portfolio Intelligence" };
export default function RootLayout({ children }) {
  return (<html lang="fr"><body><Providers>{children}</Providers></body></html>);
}
