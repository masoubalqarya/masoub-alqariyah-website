import { Cairo, Lato } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata = {
  title: "معصوب القرية | Masoub AlQarya",
  description:
    "Order authentic Yemeni masoub and receive it in your car. Masoub AlQarya drive-through.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${lato.variable} antialiased grain`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
