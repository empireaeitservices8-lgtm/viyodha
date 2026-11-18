"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

const field =
  "w-full rounded-xl border border-[#1F4D1F]/25 bg-white px-4 py-3 text-base text-[#141414] outline-none transition-colors placeholder:text-[#141414]/40 focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20";

export default function ProfilePage() {
  const { user, token, refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateProfile(
        {
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        },
        token || undefined
      );

      if (res.token) {
        localStorage.setItem("viyodha_token", res.token);
      }
      await refreshProfile();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-[#EEF3EA] py-20 px-4">
        <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className={`${serif.className} text-3xl font-semibold mb-4`} style={{ color: GREEN }}>
            Sign in to view your profile
          </h1>
          <p className="text-sm text-[#141414]/70 mb-6">
            Please log in with your account to access and edit your personal information.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] bg-[#EEF3EA] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
              Account Profile
            </h1>
            <p className="mt-1 text-sm text-[#141414]/70">
              Manage your personal contact details and password.
            </p>
          </div>
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full bg-[#C8221E] px-5 py-2 text-xs font-bold uppercase text-white hover:opacity-90"
            >
              Go to Admin Panel
            </Link>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 sm:p-10 shadow-sm">
          {message && (
            <div
              className={`mb-6 rounded-xl p-4 text-sm font-medium ${
                message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Full Name
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={field}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Contact Phone
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={field}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email Address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>

            <div className="border-t border-[#1F4D1F]/15 pt-6">
              <h2 className={`${serif.className} text-2xl font-semibold mb-1`} style={{ color: GREEN }}>
                Change Password (Optional)
              </h2>
              <p className="text-xs text-[#141414]/60 mb-5">
                Leave these blank if you do not want to change your password.
              </p>

              <div className="grid gap-5 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Current Password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className={field}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  New Password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={field}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={field}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1F4D1F]/15">
              <div className="text-xs text-[#141414]/60">
                Account Role: <span className="font-semibold uppercase text-[#1F4D1F]">{user.role}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                {loading ? "Saving changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
