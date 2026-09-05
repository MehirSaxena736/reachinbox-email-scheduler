import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Button, Input } from "../components/ui";
import { login, register } from "../api/auth";

interface AuthProps {
  mode: "login" | "signup" | "forgot-password";
  onAuth: (email: string, name: string) => void;
  onSwitchMode: (mode: "login" | "signup" | "forgot-password") => void;
}

export default function Auth({ mode, onAuth, onSwitchMode }: AuthProps) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", remember: false });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (mode === "forgot-password") {
    setForgotSent(true);
    return;
  }

  if (mode === "signup" && form.password !== form.confirm) {
    alert("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    if (mode === "login") {
      const response = await login({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem(
        "reachinbox_token",
        response.data.token
      );

      localStorage.setItem(
        "reachinbox_user",
        JSON.stringify(response.data.user)
      );

      onAuth(
        response.data.user.email,
        response.data.user.name || response.data.user.email
      );
    } else {
      const response = await register({
        email: form.email,
        password: form.password,
        name: form.name,
      });

      const loginResponse = await login({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem(
        "reachinbox_token",
        loginResponse.data.token
      );

      localStorage.setItem(
        "reachinbox_user",
        JSON.stringify(loginResponse.data.user)
      );

      onAuth(
        response.data.email,
        response.data.name || response.data.email
      );
    }
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "Authentication failed"
    );
  } finally {
    setLoading(false);
  }
};

 const handleGoogle = () => {
  window.location.href =
    "http://localhost:3000/api/google/auth";
};

  return (
    <div className="min-h-full bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white text-lg">ReachInbox</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white leading-tight">
              Turn conversations<br />into opportunities.
            </h2>
            <p className="mt-3 text-indigo-200 text-sm leading-relaxed max-w-xs">
              Personalized cold email at scale. Build sequences, automate follow-ups, and track every reply.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Smart email sequencing with auto follow-ups",
              "Real-time analytics and reply tracking",
              "Connect unlimited Gmail & SMTP accounts",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={12} className="text-white" />
                </div>
                <span className="text-indigo-100 text-sm">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"].map((c, i) => (
                <div key={i} style={{ backgroundColor: c }} className="w-7 h-7 rounded-full border-2 border-indigo-600 flex items-center justify-center text-xs text-white font-semibold">
                  {["A", "J", "S", "R"][i]}
                </div>
              ))}
            </div>
            <p className="text-indigo-200 text-xs">Trusted by <span className="text-white font-semibold">2,400+</span> sales teams</p>
          </div>
        </div>

        <div className="relative" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-slate-900 text-xl">ReachInbox</span>
          </div>

          {mode === "forgot-password" && forgotSent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">Check your inbox</h2>
                <p className="mt-1.5 text-sm text-slate-500">We sent a reset link to {form.email || "your email"}</p>
              </div>
              <button onClick={() => { setForgotSent(false); onSwitchMode("login"); }} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="font-display text-2xl font-semibold text-slate-900">
                  {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  {mode === "login" ? "Sign in to your ReachInbox workspace" :
                   mode === "signup" ? "Start your 14-day free trial. No credit card needed." :
                   "Enter your email and we'll send a reset link."}
                </p>
              </div>

              {/* Google OAuth */}
              {mode !== "forgot-password" && (
                <>
                  <button
                    onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">or</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <Input
                    label="Full name"
                    placeholder="Alex Rivera"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    icon={<User size={14} />}
                    required
                  />
                )}

                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  icon={<Mail size={14} />}
                  required
                />

                {mode !== "forgot-password" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={14} /></div>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 pr-9 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        minLength={8}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Confirm password</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={14} /></div>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.confirm}
                        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                        className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 pl-9 pr-9 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} className="w-4 h-4 accent-indigo-600 rounded" />
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <button type="button" onClick={() => onSwitchMode("forgot-password")} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" /></svg>
                      {mode === "login" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                      <ArrowRight size={15} />
                    </span>
                  )}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                {mode === "login" ? (
                  <>Don&apos;t have an account?{" "}
                    <button onClick={() => onSwitchMode("signup")} className="text-indigo-600 font-medium hover:text-indigo-700">Sign up for free</button>
                  </>
                ) : mode === "signup" ? (
                  <>Already have an account?{" "}
                    <button onClick={() => onSwitchMode("login")} className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</button>
                  </>
                ) : (
                  <button onClick={() => onSwitchMode("login")} className="text-indigo-600 font-medium hover:text-indigo-700">Back to sign in</button>
                )}
              </p>

              {mode === "signup" && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-slate-600 underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-slate-600 underline">Privacy Policy</a>.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
