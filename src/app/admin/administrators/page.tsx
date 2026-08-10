"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/context/auth-context";
import {
  getAdministrators,
  createAdministratorAccount,
  toggleAdministratorStatus,
  resetAdministratorPassword,
  AdministratorRecord,
} from "@/lib/services/admin-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  UserPlus,
  Search,
  Key,
  UserX,
  UserCheck,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  Clock,
} from "lucide-react";

export default function AdminManagementPage() {
  const { user } = useAuth();
  const [administrators, setAdministrators] = useState<AdministratorRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openCredsModal, setOpenCredsModal] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdministratorRecord | null>(null);

  // Form & Credential state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Temporary Credential Display State
  const [tempCreds, setTempCreds] = useState<{ email: string; tempPass: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const list = await getAdministrators({ search, status: statusFilter });
      setAdministrators(list);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search, statusFilter]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await createAdministratorAccount({
        firstName,
        lastName,
        email,
        phone,
      });

      if (!res.success || !res.tempPassword) {
        setFormError(res.error || "Failed to create administrator account.");
        setSubmitting(false);
        return;
      }

      setTempCreds({
        email: res.admin?.email || email,
        tempPass: res.tempPassword,
      });

      setOpenCreateModal(false);
      setOpenCredsModal(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      fetchAdmins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Creation failed.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdministratorRecord) => {
    const nextState = !admin.is_active;
    const confirmMsg = nextState
      ? `Reactivate administrator account for ${admin.first_name} ${admin.last_name}?`
      : `Deactivate administrator account for ${admin.first_name} ${admin.last_name}?`;

    if (!confirm(confirmMsg)) return;

    const res = await toggleAdministratorStatus(admin.id, nextState);
    if (res.success) {
      fetchAdmins();
    } else {
      alert(res.error || "Status update failed.");
    }
  };

  const handleResetPassword = async (admin: AdministratorRecord) => {
    if (!confirm(`Reset password for administrator ${admin.first_name} ${admin.last_name}?`)) return;

    const res = await resetAdministratorPassword(admin.id);
    if (res.success && res.tempPassword) {
      setTempCreds({
        email: admin.email,
        tempPass: res.tempPassword,
      });
      setOpenCredsModal(true);
    } else {
      alert(res.error || "Password reset failed.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCount = administrators.length;
  const activeCount = administrators.filter((a) => a.is_active).length;
  const inactiveCount = administrators.filter((a) => !a.is_active).length;

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administrator Overview", href: "/admin" },
        { label: "Administrator Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Administrator Accounts & Governance</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Provision, manage, and audit system administrator credentials for your school.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setOpenCreateModal(true)}
            className="h-8 text-xs gap-1.5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Administrator</span>
          </Button>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Administrators</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-0.5">{totalCount}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Shield className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Administrators</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Inactive / Deactivated</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{inactiveCount}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <UserX className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar & Table Card */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-sm font-bold">Administrator Roster</CardTitle>
              <CardDescription className="text-xs">
                Authorized system administrators within your school organization.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search administrators..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {(["all", "active", "inactive"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm capitalize transition-colors ${
                      statusFilter === st
                        ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={fetchAdmins} className="h-8 text-xs gap-1 px-2.5">
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : administrators.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Administrators Found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No administrator accounts match your current filter or query criteria.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Administrator Name</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {administrators.map((admin) => (
                    <TableRow key={admin.id} className="text-xs">
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {admin.first_name[0]}{admin.last_name[0]}
                          </div>
                          <span>{admin.first_name} {admin.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {admin.email}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {admin.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            admin.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          }
                        >
                          {admin.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setOpenViewModal(true);
                          }}
                          className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResetPassword(admin)}
                          className="h-7 w-7 text-slate-500 hover:text-amber-600"
                          title="Reset Password"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(admin)}
                          className={admin.is_active ? "h-7 w-7 text-slate-500 hover:text-rose-600" : "h-7 w-7 text-slate-500 hover:text-emerald-600"}
                          title={admin.is_active ? "Deactivate Account" : "Reactivate Account"}
                        >
                          {admin.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Administrator Modal */}
        <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                <span>Create Administrator Account</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provision a new administrator for your school. A secure temporary password will be generated automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 py-2 text-xs">
              {formError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                  <Input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Kwame"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                  <Input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Addo"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. k.addo@achimota.edu.gh"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Phone Number (Optional)</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="h-8 text-xs"
                />
              </div>

              <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 space-y-1 border border-slate-200/60 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Security Policy Notice:</span>
                <p>• Account role is strictly fixed to Administrator for your school.</p>
                <p>• User will be forced to change temporary password upon first login.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpenCreateModal(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  {submitting ? "Creating..." : "Provision Account"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Temporary Credentials Display Modal */}
        <Dialog open={openCredsModal} onOpenChange={setOpenCredsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
                <span>Temporary Credentials Generated</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide these temporary credentials securely to the administrator. They will be forced to update their password on first sign-in.
              </DialogDescription>
            </DialogHeader>

            {tempCreds && (
              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 text-slate-50 space-y-2 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] uppercase text-slate-400">Email</span>
                    <span className="text-xs text-white">{tempCreds.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] uppercase text-slate-400">Temporary Password</span>
                    <span className="text-xs font-bold text-emerald-400">{tempCreds.tempPass}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`Email: ${tempCreds.email}\nTemporary Password: ${tempCreds.tempPass}`)}
                  className="w-full h-8 text-xs gap-1.5 font-semibold"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Credentials"}</span>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Details Modal */}
        {selectedAdmin && (
          <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Administrator Details</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Governance profile & account status details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAdmin.first_name} {selectedAdmin.last_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Email Address</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedAdmin.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone Number</span>
                    <span>{selectedAdmin.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Role</span>
                    <Badge variant="outline" className="text-[10px]">Administrator</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Status</span>
                    <Badge variant="outline" className={selectedAdmin.is_active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                      {selectedAdmin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenViewModal(false)} className="h-8 text-xs">
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardShell>
  );
}
