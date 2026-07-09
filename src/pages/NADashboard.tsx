import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  getNADutyStatus, startNADuty, finishNADuty, getNAReports,
  fetchBookings, changeNAPassword, createNAReport
} from '../api';
import { 
  Play, Square, Clock, FileText, History, LogOut, 
  ChevronRight, Calendar, User, Loader2, CheckCircle2, Key, Plus
} from 'lucide-react';
import { PageShell, EmptyState, Modal } from '../components/ui/Layout';

const NADashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [naUser, setNaUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [childName, setChildName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('na_user');
    if (stored) {
      setNaUser(JSON.parse(stored));
    }
  }, []);

  const { data: dutyStatus, isLoading: dutyLoading } = useQuery({
    queryKey: ['naDutyStatus'],
    queryFn: getNADutyStatus,
  });

  const { data: todayReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['naReports', new Date().toISOString().split('T')[0]],
    queryFn: () => getNAReports({ date: new Date().toISOString().split('T')[0] }),
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['naBookings'],
    queryFn: () => fetchBookings('Assigned'),
  });

  const startDutyMutation = useMutation({
    mutationFn: startNADuty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naDutyStatus'] });
    },
  });

  const finishDutyMutation = useMutation({
    mutationFn: finishNADuty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naDutyStatus'] });
      queryClient.invalidateQueries({ queryKey: ['naReports'] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changeNAPassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    },
    onError: (err: any) => {
      setPasswordError(err.message || 'Password ပြောင်း၍ မရပါ');
    },
  });

  const createReportMutation = useMutation({
    mutationFn: createNAReport,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['naReports'] });
      setShowCreateModal(false);
      setSelectedBooking('');
      setChildName('');
      if (data?._id) {
        navigate(`/report/${data._id}`);
      }
    },
  });

  const handlePasswordChange = () => {
    setPasswordError('');
    
    if (!currentPassword || !newPassword) {
      setPasswordError('Password အားလုံး ဖြည့်ပါ');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password အနည်းဆုံး ၆ လုံး ထည့်ပါ');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Password အသစ် နှစ်ခု တူညီရပါမည်');
      return;
    }
    
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const handleCreateReport = () => {
    if (!selectedBooking || !childName) return;
    
    createReportMutation.mutate({
      bookingId: selectedBooking,
      date: new Date().toISOString(),
      childName,
      status: 'draft'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('na_token');
    localStorage.removeItem('na_user');
    navigate('/login');
  };

  const activeDuty = dutyStatus?.activeDuty;
  const reports = todayReports || [];
  const assignedBookings = bookingsData?.filter((b: any) => 
    b.caregiverName === naUser?.name
  ) || [];

  const todayLabel = new Date().toLocaleDateString('my-MM', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <PageShell>
      {/* Header */}
      <header className="page-header">
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
              <p className="font-bold text-slate-900 truncate">{naUser?.name || 'NA'}</p>
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

      <main className="app-container py-5 space-y-4 pb-8 safe-bottom">
        {/* Duty Status Card */}
        <section className="card card-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">အလုပ်ချိန်</h2>
            {activeDuty && (
              <span className="badge badge-success">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                လုပ်ဆောင်နေဆဲ
              </span>
            )}
          </div>
          
          {dutyLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="spinner h-6 w-6 text-primary" />
            </div>
          ) : activeDuty ? (
            <div className="space-y-4">
              <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <Clock size={18} />
                  <span className="font-semibold text-sm">အလုပ်လုပ်နေဆဲ</span>
                </div>
                <p className="text-sm text-emerald-600/90">
                  စတင်ချိန် — {new Date(activeDuty.dutyStart).toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {activeDuty.booking && (
                  <p className="text-sm text-emerald-600/90 mt-1">
                    {activeDuty.booking.bookingNumber}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => finishDutyMutation.mutate(activeDuty._id)}
                disabled={finishDutyMutation.isPending}
                className="btn btn-danger btn-full"
              >
                {finishDutyMutation.isPending ? (
                  <Loader2 className="spinner" size={20} />
                ) : (
                  <Square size={18} />
                )}
                အလုပ်ပြီးဆုံးမည်
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl p-5 text-center bg-slate-50 border border-slate-100">
                <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">အလုပ်မစတွေ့သေးပါ</p>
              </div>
              {assignedBookings.length > 0 ? (
                <div className="space-y-2">
                  <p className="field-hint !mb-2">Booking ရွေးပြီး အလုပ်စတင်ပါ</p>
                  {assignedBookings.map((booking: any) => (
                    <button
                      key={booking._id}
                      type="button"
                      onClick={() => startDutyMutation.mutate(booking._id)}
                      disabled={startDutyMutation.isPending}
                      className="btn btn-primary btn-full"
                    >
                      {startDutyMutation.isPending ? (
                        <Loader2 className="spinner" size={20} />
                      ) : (
                        <Play size={18} />
                      )}
                      {booking.bookingNumber} — အလုပ်စတင်မည်
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-2">
                  Assign ထားသည့် Booking မရှိပါ
                </p>
              )}
            </div>
          )}
        </section>

        {/* Today's Reports */}
        <section className="card card-section">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-bold text-slate-900 shrink-0">ယနေ့ Report</h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={15} />
                အသစ်
              </button>
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="btn btn-ghost btn-sm text-primary"
              >
                အားလုံး
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="spinner h-6 w-6 text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              icon={<FileText size={24} />}
              title="Report မရှိသေးပါ"
              description="အလုပ်စတင်ပြီးနောက် Report ဖြည့်နိုင်ပါသည်"
            />
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      report.status === 'submitted' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {report.status === 'submitted' ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{report.childName}</p>
                      <span className={`badge mt-1 ${
                        report.status === 'submitted' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {report.status === 'submitted' ? 'ပြီးဆုံး' : 'ဖြည့်ဆဲ'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions - temporarily hidden */}
        {/* <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="card card-section flex flex-col items-center gap-2.5 active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="section-icon !w-11 !h-11 !rounded-xl">
              <History size={22} />
            </div>
            <span className="font-semibold text-sm text-slate-700">Report မှတ်တမ်း</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="card card-section flex flex-col items-center gap-2.5 active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="section-icon !w-11 !h-11 !rounded-xl">
              <Calendar size={22} />
            </div>
            <span className="font-semibold text-sm text-slate-700">ချိန်းဆိုမှု</span>
          </button>
        </div> */}
      </main>

      {/* Create Report Modal */}
      {showCreateModal && (
        <Modal
          title="Report အသစ်ဖန်တီးရန်"
          onClose={() => {
            setShowCreateModal(false);
            setSelectedBooking('');
            setChildName('');
          }}
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedBooking('');
                  setChildName('');
                }}
                className="btn btn-secondary flex-1"
              >
                ပယ်ဖျက်ရန်
              </button>
              <button
                type="button"
                onClick={handleCreateReport}
                disabled={!selectedBooking || !childName || createReportMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {createReportMutation.isPending ? 'ဖန်တီးနေပါသည်...' : 'ဖန်တီးရန်'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="field-label">Booking ရွေးပါ</label>
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="select"
              >
                <option value="">Booking ရွေးပါ</option>
                {assignedBookings.map((booking: any) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.bookingNumber} — {booking.customerName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="field-label">ကလေးအမည်</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="input"
                placeholder="ကလေးအမည် ထည့်ပါ"
              />
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
            setPasswordError('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          footer={passwordSuccess ? undefined : (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
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
                {passwordMutation.isPending ? 'ပြောင်းနေပါသည်...' : 'ပြောင်းရန်'}
              </button>
            </>
          )}
        >
          {passwordSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-600 h-8 w-8" />
              </div>
              <p className="text-emerald-600 font-semibold">Password ပြောင်းပြီးပါပြီ!</p>
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
                  <label className="field-label">Password အသစ် ထပ်မံထည့်ပါ</label>
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
