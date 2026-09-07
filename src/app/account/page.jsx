"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Mail, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const { t } = useI18n();
  const {
    user,
    loading,
    isFullAccount,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    mapAuthError,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (isFullAccount) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="display text-4xl font-black text-primary-dark">{t.myAccount}</h1>
        <div className="clay-panel mt-8 rounded-3xl p-8">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              className="mx-auto h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User size={36} />
            </div>
          )}
          <p className="display mt-4 text-xl font-bold">
            {user.displayName || t.guest}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <Link
            href="/orders"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            {t.myOrders}
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-destructive"
          >
            <LogOut size={16} />
            {t.signOutLabel}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim() || (mode === "register" && !displayName.trim())) {
      setError(t.fillAllFields);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
    } catch (err) {
      const key = mapAuthError(err?.code);
      setError(t[key] || t.authError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const key = mapAuthError(err?.code);
      setError(t[key] || t.authError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="display text-4xl font-black text-primary-dark">{t.myAccount}</h1>
      <p className="mt-2 text-muted-foreground">{t.signInOrCreate}</p>

      <div className="mt-6 grid grid-cols-2 rounded-full bg-secondary p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={cn(
            "rounded-full py-2 text-sm font-bold",
            mode === "login" && "bg-card shadow-sm",
          )}
        >
          {t.signIn}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={cn(
            "rounded-full py-2 text-sm font-bold",
            mode === "register" && "bg-card shadow-sm",
          )}
        >
          {t.createAccount}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <User size={16} /> {t.fullName}
            </span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none ring-primary focus:ring-2"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Mail size={16} /> {t.emailPlaceholder}
          </span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none ring-primary focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">{t.passwordPlaceholder}</span>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none ring-primary focus:ring-2"
          />
        </label>

        {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {mode === "login" ? t.signIn : t.createAccount}
        </button>
      </form>

      <p className="my-6 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t.orContinueWith}
      </p>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="w-full rounded-full border border-border bg-card py-3 text-sm font-bold disabled:opacity-60"
      >
        {t.signInWithGoogle}
      </button>
    </div>
  );
}
