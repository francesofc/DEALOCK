"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, Sparkles, Loader2 } from "lucide-react";

type Mode = "signin" | "signup" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess("Lien magique envoyé. Vérifiez votre boîte mail.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8 relative z-10"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "0.5px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Logo + brand */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/brand/dealock-symbol-white.svg" alt="" className="h-9 w-auto object-contain" />
          <div>
            <p className="text-lg font-semibold tracking-tight">Dealock</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Commercial OS</p>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-medium tracking-tight mb-1">
          {mode === "signin" && "Bon retour"}
          {mode === "signup" && "Créer votre compte"}
          {mode === "magic" && "Lien magique"}
        </h1>
        <p className="text-sm text-white/50 mb-7">
          {mode === "signin" && "Connectez-vous à votre cockpit boutique"}
          {mode === "signup" && "Quelques secondes pour démarrer"}
          {mode === "magic" && "Recevez un lien sécurisé par email"}
        </p>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "0.5px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {[
            { id: "signin" as Mode, label: "Se connecter" },
            { id: "signup" as Mode, label: "S'inscrire" },
            { id: "magic" as Mode, label: "Lien magique" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === tab.id ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
              style={mode === tab.id ? {
                background: "rgba(255, 255, 255, 0.08)",
                border: "0.5px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 4px 16px rgba(109, 77, 255, 0.15)",
              } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-white/45 font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@agence.fr"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "0.5px solid rgba(255, 255, 255, 0.08)",
                }}
              />
            </div>
          </div>

          {/* Password (only for signin/signup) */}
          {mode !== "magic" && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/45 font-medium">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "0.5px solid rgba(255, 255, 255, 0.08)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="text-xs p-3 rounded-lg"
              style={{
                background: "rgba(255, 61, 100, 0.12)",
                border: "0.5px solid rgba(255, 61, 100, 0.3)",
                color: "#FF8AA6",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="text-xs p-3 rounded-lg"
              style={{
                background: "rgba(0, 255, 170, 0.10)",
                border: "0.5px solid rgba(0, 255, 170, 0.30)",
                color: "#6AFFC8",
              }}
            >
              {success}
            </div>
          )}

          {/* Submit button — Aurora gradient */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #6D4DFF 0%, #FF3D8B 100%)",
              boxShadow: "0 6px 24px rgba(109, 77, 255, 0.45)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Patientez...</span>
              </>
            ) : (
              <>
                {mode === "signin" && <span>Se connecter</span>}
                {mode === "signup" && <span>Créer mon compte</span>}
                {mode === "magic" && (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Recevoir le lien</span>
                  </>
                )}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-[11px] text-white/35 text-center mt-7 leading-relaxed">
          En continuant, vous acceptez les conditions d'utilisation de Dealock.
        </p>
      </div>
    </div>
  );
}
