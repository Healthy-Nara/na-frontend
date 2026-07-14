import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getNAReports } from '../api';
import { 
  FileText, CheckCircle2, Clock, 
  ChevronRight, Calendar, Loader2
} from 'lucide-react';
import { PageShell, PageHeader, EmptyState } from '../components/ui/Layout';

const NAReportHistory = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['naReports', selectedDate],
    queryFn: () => getNAReports({ date: selectedDate }),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('my-MM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="Report မှတ်တမ်း"
        onBack={() => navigate('/')}
      />

      <main className="app-container py-5 space-y-4 pb-8 safe-bottom">
        {/* Date Picker */}
        <section className="card card-section">
          <label className="field-label" htmlFor="report-date">ရက်စွဲ ရွေးချယ်ရန်</label>
          <div className="flex items-center gap-3">
            <div className="section-icon">
              <Calendar size={18} />
            </div>
            <input
              id="report-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input flex-1 !min-h-[2.5rem]"
            />
          </div>
        </section>

        {/* Quick Date Selection */}
        <section className="card card-section !py-4">
          <p className="field-hint !mb-3">အမြန်ရွေးချယ်ရန်</p>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6].map((daysAgo) => {
              const date = new Date();
              date.setDate(date.getDate() - daysAgo);
              const dateStr = date.toISOString().split('T')[0];
              return (
                <button
                  key={daysAgo}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`chip ${selectedDate === dateStr ? 'chip-active' : ''}`}
                >
                  {daysAgo === 0 ? 'ယနေ့' : 
                   daysAgo === 1 ? 'မနေ့' : 
                   `${daysAgo} ရက်လွန်`}
                </button>
              );
            })}
          </div>
        </section>

        {/* Reports List */}
        <section className="card card-section">
          <h2 className="font-bold text-slate-900 mb-4">
            {formatDate(selectedDate)}
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="spinner h-6 w-6 text-primary" />
            </div>
          ) : !reports || reports.length === 0 ? (
            <EmptyState
              icon={<FileText size={24} />}
              title="Report မရှိပါ"
              description="ဤရက်စွဲအတွက် Report မှတ်တမ်း မရှိသေးပါ"
            />
          ) : (
            <div className="space-y-2">
              {reports.map((report: any) => (
                <button
                  key={report._id}
                  type="button"
                  onClick={() => navigate(`/report/${report._id}/view`)}
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
                        <Clock size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{report.childName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`badge ${
                          report.status === 'submitted' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {report.status === 'submitted' ? 'ပြီးဆုံး' : 'ဖြည့်ဆဲ'}
                        </span>
                        {report.submittedAt && (
                          <span className="text-xs text-slate-400">
                            {new Date(report.submittedAt).toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
};

export default NAReportHistory;
