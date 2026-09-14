"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Mail,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&status=${statusFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUserStatus = async (user: any) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    const confirmText =
      newStatus === "suspended"
        ? `Are you sure you want to suspend account "${user.name}"? They will be unable to comment or message.`
        : `Reinstate account "${user.name}" to active status?`;

    if (!confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/admin/users/${user._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <Users size={13} />
            <span>Community Directory // Members</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            User Accounts &amp; Permissions
          </h1>
        </div>

        <div className="text-xs font-mono text-muted uppercase tracking-widest bg-surface border border-surface-border px-3 py-1.5">
          {users.length} Registered Members
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface/40 border border-surface-border">
        <div className="flex items-center gap-1">
          {["all", "active", "suspended"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full bg-background border border-surface-border pl-10 pr-4 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-surface/40 border border-surface-border overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-surface-border bg-surface/80 uppercase text-muted tracking-wider">
            <tr>
              <th className="p-4">Member Identity</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Commentary</th>
              <th className="p-4 text-center">Dialogues</th>
              <th className="p-4">Enrolled Date</th>
              <th className="p-4 text-right">Moderation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-surface-subtle transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full bg-surface border border-surface-border overflow-hidden flex items-center justify-center text-xs font-medium">
                      {u.avatarUrl ? (
                        <Image src={u.avatarUrl} alt={u.name} fill className="object-cover" />
                      ) : (
                        <span>{u.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-display font-medium text-foreground text-sm block">
                        {u.name}
                      </span>
                      {u.username && (
                        <span className="text-[10px] text-muted block">@{u.username}</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-4 text-muted">{u.email}</td>

                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                      u.status === "active"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : "bg-red-950/40 text-red-400 border border-red-800/40"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 text-muted">
                    <MessageSquare size={11} />
                    <span>{u.commentsCount}</span>
                  </span>
                </td>

                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Mail size={11} />
                    <span>{u.conversationsCount}</span>
                  </span>
                </td>

                <td className="p-4 text-muted text-[11px]">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleUserStatus(u)}
                    className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors border ${
                      u.status === "active"
                        ? "border-red-900/50 text-red-400 hover:bg-red-950/30"
                        : "border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30"
                    }`}
                  >
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  No members found in this directory query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

