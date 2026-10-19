"use client";

import PublicInfoPage from "@/components/PublicInfoPage";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();

  return <PublicInfoPage {...t.privacyPage} />;
}
