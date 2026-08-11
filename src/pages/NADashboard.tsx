import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getNADutyStatus,
  startNADuty,
  finishNADuty,
  getNAReports,
  fetchBookings,
  changeNAPassword,
  createNAReport,
} from "../api";
import {
  Play,
  Square,
  Clock,
  FileText,
  LogOut,
  ChevronRight,
  User,
  Loader2,
  CheckCircle2,
  Key,
  Plus,
} from "lucide-react";
import { PageShell, Modal } from "../components/ui/Layout";

const today = new Date().toISOString().split("T")[0];
const reportReadyKey = `na_report_ready_${today}`;

const NADashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [naUser, setNaUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showReportSection, setShowReportSection] = useState(
    () => sessionStorage.getItem(reportReadyKey) === "true",
  );

  useEffect(() => {
    const stored = localStorage.getItem("na_user");
    if (stored) {
      setNaUser(JSON.parse(stored));
    }
  }, []);

  const { data: dutyStatus, isLoading: dutyLoading } = useQuery({
    queryKey: ["naDutyStatus"],
    queryFn: getNADutyStatus,
  });

  const { data: todayReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["naReports", today],
    queryFn: () => getNAReports({ date: today }),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ["naBookings"],
    queryFn: () => fetchBookings("Assigned"),
  });

  useEffect(() => {
    if (todayReports && todayReports.length > 0) {
      setShowReportSection(true);
      sessionStorage.setItem(reportReadyKey, "true");
    }
  }, [todayReports]);

  const startDutyMutation = useMutation({
    mutationFn: startNADuty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["naDutyStatus"] });
    },
  });

  const finishDutyMutation = useMutation({
    mutationFn: finishNADuty,
    onSuccess: () => {
      setShowReportSection(true);
      sessionStorage.setItem(reportReadyKey, "true");
      queryClient.invalidateQueries({ queryKey: ["naDutyStatus"] });
      queryClient.invalidateQueries({ queryKey: ["naReports"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changeNAPassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    },
    onError: (err: any) => {
      setPasswordError(err.message || "Password ပြောင်း၍ မရပါ");
    },
  });

  const createReportMutation = useMutation({
    mutationFn: createNAReport,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["naReports"] });
      setShowCreateModal(false);
      setSelectedBooking("");
      if (data?._id) {
        navigate(`/report/${data._id}`);
      }
    },
  });

  const handlePasswordChange = () => {
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Password အားလုံး ဖြည့်ပါ");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password အနည်းဆုံး ၆ လုံး ထည့်ပါ");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Password အသစ် နှစ်ခု တူညီရပါမည်");
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const handleCreateReport = () => {
    if (!selectedBooking) return;

    createReportMutation.mutate({
      bookingId: selectedBooking,
      date: new Date().toISOString(),
      status: "draft",
    });
  };

  const handleOpenCreateModal = () => {
    if (assignedBooking) {
      setSelectedBooking(assignedBooking._id);
    }
    setShowCreateModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("na_token");
    localStorage.removeItem("na_user");
    navigate("/login");
  };

  const activeDuty = dutyStatus?.activeDuty;
  const reports = todayReports || [];
  const assignedBookings =
    bookingsData?.filter((b: any) => b.caregiverName === naUser?.name) || [];
  const assignedBooking = assignedBookings[0] ?? null;

  const todayLabel = new Date().toLocaleDateString("my-MM", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <PageShell>
      <header className="page-header page-header-dashboard">
        <div className="page-header-inner">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center shadow-md shadow-primary/20">
                <User className="text-white h-5 w-5" />
              </div>
              {activeDuty && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">
                {naUser?.name || "NA"}
              </p>
              <p className="text-xs text-slate-500">{todayLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-ghost btn-icon"
              title="Password ပြောင်းရန်"
              aria-label="Password ပြောင်းရန်"
            >
              <Key size={20} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost btn-icon text-slate-400 hover:!text-red-500"
              aria-label="ထွက်ရန်"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-container pt-4 pb-5 flex flex-col min-h-[calc(100dvh-4.5rem)]">
        {/* Today's Reports — only after finish duty */}
        <div className="flex-1">
        {showReportSection && !activeDuty && reports.length > 0 && (
          <section className="card card-dashboard card-section">
            <div className="report-card-header">
              <h2 className="font-bold text-slate-900 text-[1.0625rem] shrink-0">ယနေ့ Report</h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="btn btn-primary btn-sm !rounded-full"
                >
                  <Plus size={15} />
                  အသစ်
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/reports")}
                  className="btn btn-ghost btn-sm text-primary !px-2"
                >
                  အားလုံး
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="spinner h-6 w-6 text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="report-empty-box">
                <div className="empty-state-icon">
                  <FileText size={22} />
                </div>
                <p className="font-semibold text-slate-700 text-[0.9375rem]">Report မရှိသေးပါ</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  အလုပ်ပြီးဆုံးပြီးနောက် Report ဖြည့်နိုင်ပါသည်
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((report: any) => (
                  <button
                    key={report._id}
                    type="button"
                    onClick={() => navigate(`/report/${report._id}`)}
                    className="list-item"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          report.status === "submitted"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {report.status === "submitted" ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {report.childName}
                        </p>
                        <span
                          className={`badge mt-1 ${
                            report.status === "submitted"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {report.status === "submitted"
                            ? "ပြီးဆုံး"
                            : "ဖြည့်ဆဲ"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-400 shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
        </div>

        {/* Duty Status Card - at bottom for easy thumb access */}
        <section className="card card-dashboard card-section mt-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-[1.0625rem]">အလုပ်ချိန်</h2>
            {activeDuty && (
              <span className="badge badge-success">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                လုပ်ဆောင်နေဆဲ
              </span>
            )}
          </div>

          <div className="dashboard-action-area">
            {dutyLoading ? (
              <Loader2 className="spinner h-7 w-7 text-primary" />
            ) : activeDuty ? (
              <div className="w-full space-y-3">
                <div className="rounded-xl p-3.5 bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <Clock size={17} />
                    <span className="font-semibold text-sm">အလုပ်လုပ်နေဆဲ</span>
                  </div>
                  <p className="text-sm text-emerald-600/90">
                    စတင်ချိန် —{" "}
                    {new Date(activeDuty.dutyStart).toLocaleTimeString("my-MM", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {activeDuty.booking && (
                    <p className="text-sm font-medium text-emerald-700 mt-0.5">
                      {activeDuty.booking.bookingNumber}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => finishDutyMutation.mutate(activeDuty._id)}
                  disabled={finishDutyMutation.isPending}
                  className="btn btn-danger btn-hero-danger btn-full"
                >
                  {finishDutyMutation.isPending ? (
                    <Loader2 className="spinner" size={24} />
                  ) : (
                    <>
                      <Square size={22} />
                      အလုပ်ပြီးဆုံးမည်
                    </>
                  )}
                </button>
              </div>
            ) : assignedBooking ? (
              <button
                type="button"
                onClick={() => startDutyMutation.mutate(assignedBooking._id)}
                disabled={startDutyMutation.isPending}
                className="btn btn-primary btn-hero-start btn-full"
              >
                {startDutyMutation.isPending ? (
                  <Loader2 className="spinner" size={28} />
                ) : (
                  <>
                    <div className="hero-icon-row">
                      <Play size={26} fill="currentColor" />
                      <span>အလုပ်စတင်မည်</span>
                    </div>
                    <span className="text-sm font-medium opacity-85">
                      {assignedBooking.bookingNumber}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-sm text-slate-500 text-center px-4">
                Assign ထားသည့် Booking မရှိပါ
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Create Report Modal */}
      {showCreateModal && (
        <Modal
          title="Report အသစ်ဖန်တီးရန်"
          onClose={() => {
            setShowCreateModal(false);
            setSelectedBooking("");
          }}
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedBooking("");
                }}
                className="btn btn-secondary flex-1"
              >
                ပယ်ဖျက်ရန်
              </button>
              <button
                type="button"
                onClick={handleCreateReport}
                disabled={
                  !selectedBooking ||
                  createReportMutation.isPending
                }
                className="btn btn-primary flex-1"
              >
                {createReportMutation.isPending
                  ? "ဖန်တီးနေပါသည်..."
                  : "ဖန်တီးရန်"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {assignedBooking && (
              <div className="record-card !py-3">
                <p className="text-xs text-slate-500 mb-0.5">Booking</p>
                <p className="text-sm font-semibold text-slate-800">
                  {assignedBooking.bookingNumber}
                  {assignedBooking.customerName && (
                    <span className="font-normal text-slate-500">
                      {" "}
                      — {assignedBooking.customerName}
                    </span>
                  )}
                </p>
              </div>
            )}

            <div>
              <label className="field-label">ကလေးအမည်</label>
              <p className="text-sm text-slate-500 mt-1">ကလေးအမည်ကို အလိုအလျောက် ဖြည့်ပေးပါမည်</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal
          title="Password ပြောင်းရန်"
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordError("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
          footer={
            passwordSuccess ? undefined : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="btn btn-secondary flex-1"
                >
                  ပယ်ဖျက်ရန်
                </button>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={passwordMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {passwordMutation.isPending
                    ? "ပြောင်းနေပါသည်..."
                    : "ပြောင်းရန်"}
                </button>
              </>
            )
          }
        >
          {passwordSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-600 h-8 w-8" />
              </div>
              <p className="text-emerald-600 font-semibold">
                Password ပြောင်းပြီးပါပြီ!
              </p>
            </div>
          ) : (
            <>
              {passwordError && (
                <div className="alert alert-error mb-4">{passwordError}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="field-label">လက်ရှိ Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="လက်ရှိ password ထည့်ပါ"
                  />
                </div>
                <div>
                  <label className="field-label">Password အသစ်</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="Password အသစ် ထည့်ပါ"
                  />
                </div>
                <div>
                  <label className="field-label">
                    Password အသစ် ထပ်မံထည့်ပါ
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="Password အသစ် ထပ်မံထည့်ပါ"
                  />
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </PageShell>
  );
};

export default NADashboard;
