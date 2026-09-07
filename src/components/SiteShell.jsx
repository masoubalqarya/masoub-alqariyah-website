"use client";

import Header from "./Header";
import Footer from "./Footer";
import PendingOrderBanner from "./PendingOrderBanner";

export default function SiteShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PendingOrderBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
