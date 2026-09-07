"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { I18nProvider } from "@/lib/i18n";
import SiteShell from "@/components/SiteShell";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
