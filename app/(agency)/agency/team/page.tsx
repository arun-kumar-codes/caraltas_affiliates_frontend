"use client"

import { useEffect, useState } from "react"
import { Users as UsersIcon, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { agencyAPI, AgencyProfile, AgencyUser, CreateAgencyUserRequest, UpdateAgencyUserRequest } from "@/lib/api"

export default function TeamPage() {
  const [profile, setProfile] = useState<AgencyProfile | null>(null)
  const [users, setUsers] = useState<AgencyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AgencyUser | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [addForm, setAddForm] = useState<CreateAgencyUserRequest>({ email: "", password: "", name: "", role: "DEALER_USER" })
  const [editForm, setEditForm] = useState<UpdateAgencyUserRequest>({})

  const isAdmin = profile?.role === "DEALER_ADMIN"

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [profileData, usersData] = await Promise.all([agencyAPI.getProfile(), agencyAPI.getUsers()])
      setProfile(profileData)
      setUsers(usersData)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load team")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.email?.trim() || !addForm.password) {
      setError("Email and password are required")
      return
    }
    try {
      setSaving(true)
      setError(null)
      await agencyAPI.createUser({
        email: addForm.email.trim(),
        password: addForm.password,
        name: addForm.name?.trim() || undefined,
        role: addForm.role,
      })
      setShowAddModal(false)
      setAddForm({ email: "", password: "", name: "", role: "DEALER_USER" })
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      setSaving(true)
      setError(null)
      await agencyAPI.updateUser(editingUser.id, editForm)
      setEditingUser(null)
      setEditForm({})
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this user from the team?")) return
    try {
      setDeletingId(id)
      setError(null)
      await agencyAPI.deleteUser(id)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove user")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UsersIcon className="h-7 w-7" />
            Team
          </h1>
          <p className="text-muted-foreground mt-1">Manage users who can access your organisation&apos;s data and listings.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => { setShowAddModal(true); setError(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Add user
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Added</th>
                {isAdmin && <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-muted-foreground">
                    No team users yet. {isAdmin && "Add a user to let them sign in and access your listings."}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4 text-foreground">{u.email}</td>
                    <td className="py-3 px-4 text-foreground">{u.name || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === "DEALER_ADMIN" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {u.role === "DEALER_ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => { setEditingUser(u); setEditForm({ name: u.name ?? undefined, role: u.role as "DEALER_ADMIN" | "DEALER_USER" }); setError(null); }}
                          className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="p-2 text-muted-foreground hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 ml-1"
                          aria-label="Remove"
                        >
                          {deletingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Add team user</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={addForm.name ?? ""}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select
                  value={addForm.role ?? "DEALER_USER"}
                  onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value as "DEALER_ADMIN" | "DEALER_USER" }))}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="DEALER_USER">User (listings only)</option>
                  <option value="DEALER_ADMIN">Admin (listings + team)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-xl border border-border text-foreground hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
                  {saving ? "Adding..." : "Add user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingUser(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Edit user</h2>
            <p className="text-sm text-muted-foreground mb-4">{editingUser.email}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name ?? editingUser.name ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select
                  value={editForm.role ?? editingUser.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value as "DEALER_ADMIN" | "DEALER_USER" }))}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="DEALER_USER">User</option>
                  <option value="DEALER_ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2 rounded-xl border border-border text-foreground hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
