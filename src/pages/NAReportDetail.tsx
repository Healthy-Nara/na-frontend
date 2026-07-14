import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getNAReportById } from '../api';
import { 
  Edit, Droplets, Baby, Moon, Activity, 
  AlertCircle, CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { PageShell, PageHeader, LoadingScreen } from '../components/ui/Layout';

const NAReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery({
    queryKey: ['naReport', id],
    queryFn: () => getNAReportById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!report) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[100dvh]">
          <p className="text-slate-500">Report ရှာမတွေ့ပါ</p>
        </div>
      </PageShell>
    );
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' });
  };

  const reportDate = new Date(report.date).toLocaleDateString('my-MM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageShell>
      <PageHeader
        title="Report အသေးစိတ်"
        subtitle={`${report.childName} · ${reportDate}`}
        onBack={() => navigate('/reports')}
        actions={
          report.status === 'draft' ? (
            <button
              type="button"
              onClick={() => navigate(`/report/${report._id}`)}
              className="btn btn-ghost btn-icon text-primary"
              aria-label="တည်းဖြတ်ရန်"
            >
              <Edit size={20} />
            </button>
          ) : undefined
        }
      />

      <main className="app-container py-5 space-y-4 pb-8 safe-bottom">
        {/* Status Badge */}
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          report.status === 'submitted' 
            ? 'bg-emerald-50 border border-emerald-100' 
            : 'bg-amber-50 border border-amber-100'
        }`}>
          {report.status === 'submitted' ? (
            <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
          ) : (
            <Clock className="text-amber-600 shrink-0" size={22} />
          )}
          <div>
            <p className={`font-semibold text-sm ${
              report.status === 'submitted' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {report.status === 'submitted' ? 'ပေးပို့ပြီး' : 'မဖြည့်သေးပါ'}
            </p>
            {report.submittedAt && (
              <p className="text-xs text-emerald-600/80 mt-0.5">
                {new Date(report.submittedAt).toLocaleString('my-MM')}
              </p>
            )}
          </div>
        </div>

        {/* Nutrition & Feeding */}
        <section className="card card-section">
          <h2 className="section-title">
            <span className="section-icon"><Droplets size={18} /></span>
            အာဟာရနှင့် အစာကျွေးခြင်း
          </h2>

          {report.feedingRecords?.length > 0 ? (
            <div className="space-y-2">
              {report.feedingRecords.map((record: any, index: number) => (
                <div key={index} className="record-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800">
                      {record.type === 'breast_milk' ? 'မိခင်နို့' : 'ဖော်စပ်နို့'}
                    </span>
                    <span className="text-sm font-medium text-primary">{record.amount}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {formatTime(record.time)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {record.burpingDone && <span className="badge badge-success">နို့တိုက်ပြီး</span>}
                    {record.airReleased && <span className="badge badge-success">လေထုတ်ပြီး</span>}
                    {record.spitUp && <span className="badge badge-danger">နို့အန်</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-2">အစာကျွေးချိန် မရှိပါ</p>
          )}

          {report.supplementaryFood && (
            <div className="mt-4 record-card">
              <p className="text-xs font-semibold text-slate-500 mb-1">ဖြည့်စွက်စာ</p>
              <p className="text-sm text-slate-800">{report.supplementaryFood}</p>
            </div>
          )}
        </section>

        {/* Personal Hygiene */}
        <section className="card card-section">
          <h2 className="section-title">
            <span className="section-icon"><Baby size={18} /></span>
            တစ်ကိုယ်ရည် သန့်ရှင်းရေး
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ရေချိုးချိန်', value: formatTime(report.hygiene?.bathTime) },
              { 
                label: 'ရေချိုးနည်း', 
                value: report.hygiene?.bathType === 'bath' ? 'ရေချိုးခြင်း' : 
                       report.hygiene?.bathType === 'sponge_bath' ? 'ရေပတ်တိုက်ခြင်း' : '-'
              },
              { label: 'Diaper လဲ', value: `${report.hygiene?.diaperChanges || 0} အကိမ်` },
              { 
                label: 'ဆီးပူ/ဝမ်းပူ', 
                value: report.hygiene?.rashCheck ? 'ရှိ' : 'မရှိ',
                highlight: report.hygiene?.rashCheck ? 'text-red-600' : 'text-emerald-600'
              },
            ].map((item) => (
              <div key={item.label} className="record-card !p-3">
                <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                <p className={`text-sm font-semibold ${item.highlight || 'text-slate-800'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sleeping */}
        <section className="card card-section">
          <h2 className="section-title">
            <span className="section-icon"><Moon size={18} /></span>
            အိပ်ချိန်
          </h2>

          {report.sleepRecords?.length > 0 ? (
            <div className="space-y-2">
              {report.sleepRecords.map((record: any, index: number) => (
                <div key={index} className="record-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800">
                      {record.type === 'day' ? 'နေ့ဘက်' : 'ညဘက်'}
                    </span>
                    <span className={`badge ${record.onSchedule ? 'badge-success' : 'badge-warning'}`}>
                      {record.onSchedule ? 'အချိန်မှန်' : 'အချိန်မမှန်'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>အိပ် {formatTime(record.startTime)}</span>
                    <span>နိုး {formatTime(record.endTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-2">အိပ်ချိန် မရှိပါ</p>
          )}
        </section>

        {/* Activity & Exercise */}
        <section className="card card-section">
          <h2 className="section-title">
            <span className="section-icon"><Activity size={18} /></span>
            လှုပ်ရှားမှုနှင့် လေ့ကျင့်ခန်း
          </h2>

          {report.activities?.length > 0 ? (
            <div className="space-y-2">
              {report.activities.map((activity: any, index: number) => (
                <div key={index} className="record-card flex items-center justify-between !py-3">
                  <span className="text-sm font-medium text-slate-800">
                    {activity.type === 'exercise' ? 'လေ့ကျင့်ခန်း' :
                     activity.type === 'flash_cards' ? 'Flash Card' : 'ပုံပြင်ဖတ်ခြင်း'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{formatTime(activity.time)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-2">လှုပ်ရှားမှု မရှိပါ</p>
          )}
        </section>

        {/* Analysis & Unusual Findings */}
        <section className="card card-section">
          <h2 className="section-title">
            <span className="section-icon"><AlertCircle size={18} /></span>
            ထူးခြားဖြစ်စဉ်များ
          </h2>

          {report.abnormalities ? (
            <div className="alert alert-error !rounded-xl whitespace-pre-wrap">
              {report.abnormalities}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-2">ထူးခြားဖြစ်စဉ် မရှိပါ</p>
          )}
        </section>
      </main>
    </PageShell>
  );
};

export default NAReportDetail;
