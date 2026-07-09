import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getNAReportById, updateNAReport } from '../api';
import { 
  Save, Send, Plus, Trash2, Loader2, 
  Baby, Droplets, Moon, Activity, AlertCircle,
  ArrowLeft, CheckCircle2
} from 'lucide-react';
import { PageShell, PageHeader, LoadingScreen, BottomBar } from '../components/ui/Layout';

interface FeedingRecord {
  type: 'breast_milk' | 'formula';
  time: string;
  amount: string;
  burpingDone: boolean;
  airReleased: boolean;
  spitUp: boolean;
}

interface SleepRecord {
  type: 'day' | 'night';
  startTime: string;
  endTime: string;
  onSchedule: boolean;
}

interface Activity {
  type: 'exercise' | 'flash_cards' | 'story_reading';
  time: string;
}

const NAReportForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [supplementaryFood, setSupplementaryFood] = useState('');
  const [hygiene, setHygiene] = useState({
    bathTime: '',
    bathType: '' as 'bath' | 'sponge_bath' | '',
    diaperChanges: 0,
    rashCheck: false,
  });
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [abnormalities, setAbnormalities] = useState('');

  const { data: report, isLoading } = useQuery({
    queryKey: ['naReport', id],
    queryFn: () => getNAReportById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (report) {
      setFeedingRecords(report.feedingRecords || []);
      setSupplementaryFood(report.supplementaryFood || '');
      setHygiene({
        bathTime: report.hygiene?.bathTime ? new Date(report.hygiene.bathTime).toISOString().slice(11, 16) : '',
        bathType: report.hygiene?.bathType || '',
        diaperChanges: report.hygiene?.diaperChanges || 0,
        rashCheck: report.hygiene?.rashCheck || false,
      });
      setSleepRecords(report.sleepRecords || []);
      setActivities(report.activities || []);
      setAbnormalities(report.abnormalities || '');
    }
  }, [report]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateNAReport(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naReport', id] });
      queryClient.invalidateQueries({ queryKey: ['naReports'] });
      navigate('/');
    },
  });

  const addFeedingRecord = () => {
    setFeedingRecords([...feedingRecords, {
      type: 'breast_milk',
      time: new Date().toISOString().slice(11, 16),
      amount: '60ml',
      burpingDone: false,
      airReleased: false,
      spitUp: false,
    }]);
  };

  const removeFeedingRecord = (index: number) => {
    setFeedingRecords(feedingRecords.filter((_, i) => i !== index));
  };

  const updateFeedingRecord = (index: number, field: keyof FeedingRecord, value: any) => {
    const updated = [...feedingRecords];
    updated[index] = { ...updated[index], [field]: value };
    setFeedingRecords(updated);
  };

  const addSleepRecord = () => {
    setSleepRecords([...sleepRecords, {
      type: 'day',
      startTime: new Date().toISOString().slice(11, 16),
      endTime: '',
      onSchedule: true,
    }]);
  };

  const removeSleepRecord = (index: number) => {
    setSleepRecords(sleepRecords.filter((_, i) => i !== index));
  };

  const updateSleepRecord = (index: number, field: keyof SleepRecord, value: any) => {
    const updated = [...sleepRecords];
    updated[index] = { ...updated[index], [field]: value };
    setSleepRecords(updated);
  };

  const addActivity = () => {
    setActivities([...activities, {
      type: 'exercise',
      time: new Date().toISOString().slice(11, 16),
    }]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, field: keyof Activity, value: any) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    const reportData = {
      bookingId: report?.booking?._id || report?.booking,
      date: report?.date,
      childName: report?.childName,
      feedingRecords: feedingRecords.map(r => ({
        ...r,
        time: r.time ? new Date(`2000-01-01T${r.time}`) : new Date(),
      })),
      supplementaryFood,
      hygiene: {
        bathTime: hygiene.bathTime ? new Date(`2000-01-01T${hygiene.bathTime}`) : undefined,
        bathType: hygiene.bathType || undefined,
        diaperChanges: hygiene.diaperChanges,
        rashCheck: hygiene.rashCheck,
      },
      sleepRecords: sleepRecords.map(r => ({
        ...r,
        startTime: r.startTime ? new Date(`2000-01-01T${r.startTime}`) : undefined,
        endTime: r.endTime ? new Date(`2000-01-01T${r.endTime}`) : undefined,
      })),
      activities: activities.map(a => ({
        ...a,
        time: a.time ? new Date(`2000-01-01T${a.time}`) : undefined,
      })),
      abnormalities,
      status,
    };
    updateMutation.mutate(reportData);
  };

  const sections = [
    { id: 'feeding', title: 'အာဟာရနှင့် အစာကျွေးခြင်း', icon: Droplets, filled: feedingRecords.length > 0 || !!supplementaryFood },
    { id: 'hygiene', title: 'တစ်ကိုယ်ရည် သန့်ရှင်းရေး', icon: Baby, filled: !!hygiene.bathTime || hygiene.diaperChanges > 0 || hygiene.rashCheck },
    { id: 'sleep', title: 'အိပ်ချိန်', icon: Moon, filled: sleepRecords.length > 0 },
    { id: 'activity', title: 'လှုပ်ရှားမှုနှင့် လေ့ကျင့်ခန်း', icon: Activity, filled: activities.length > 0 },
    { id: 'abnormalities', title: 'ထူးခြားဖြစ်စဉ်များ', icon: AlertCircle, filled: !!abnormalities },
  ];

  const renderSectionContent = () => {
    switch (openSection) {
      case 'feeding':
        return (
          <div className="space-y-3">
            {feedingRecords.map((record, index) => (
              <div key={index} className="record-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">#{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFeedingRecord(index)}
                    className="btn btn-ghost btn-icon !min-h-8 !min-w-8 text-red-500 hover:!bg-red-50"
                    aria-label="ဖျက်ရန်"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-hint">အမျိုးအစား</label>
                    <select
                      value={record.type}
                      onChange={(e) => updateFeedingRecord(index, 'type', e.target.value)}
                      className="select !min-h-[2.5rem] !text-sm"
                    >
                      <option value="breast_milk">မိခင်နို့</option>
                      <option value="formula">ဖော်စပ်နို့</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-hint">ပမာဏ</label>
                    <select
                      value={record.amount}
                      onChange={(e) => updateFeedingRecord(index, 'amount', e.target.value)}
                      className="select !min-h-[2.5rem] !text-sm"
                    >
                      <option value="30ml">30 ml</option>
                      <option value="60ml">60 ml</option>
                      <option value="90ml">90 ml</option>
                      <option value="120ml">120 ml</option>
                      <option value="150ml">150 ml</option>
                      <option value="180ml">180 ml</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="field-hint">အချိန်</label>
                    <input
                      type="time"
                      value={record.time}
                      onChange={(e) => updateFeedingRecord(index, 'time', e.target.value)}
                      className="input !min-h-[2.5rem] !text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={record.burpingDone}
                      onChange={(e) => updateFeedingRecord(index, 'burpingDone', e.target.checked)}
                    />
                    <span className="text-sm">နို့တိုက်ပြီး</span>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={record.airReleased}
                      onChange={(e) => updateFeedingRecord(index, 'airReleased', e.target.checked)}
                    />
                    <span className="text-sm">လေထုတ်ပေးပြီး</span>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={record.spitUp}
                      onChange={(e) => updateFeedingRecord(index, 'spitUp', e.target.checked)}
                    />
                    <span className="text-sm">နို့အန်</span>
                  </label>
                </div>
              </div>
            ))}

            <button type="button" onClick={addFeedingRecord} className="add-btn">
              <Plus size={18} />
              အစာကျွေးချိန် ထည့်ရန်
            </button>

            <div>
              <label className="field-label">ဖြည့်စွက်စာ (၆လအထက်)</label>
              <input
                type="text"
                value={supplementaryFood}
                onChange={(e) => setSupplementaryFood(e.target.value)}
                placeholder="ဖြည့်စွက်စာ အကြောင်းရေးပါ"
                className="input !text-sm"
              />
            </div>
          </div>
        );

      case 'hygiene':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-hint">ရေချိုးချိန်</label>
                <input
                  type="time"
                  value={hygiene.bathTime}
                  onChange={(e) => setHygiene({ ...hygiene, bathTime: e.target.value })}
                  className="input !min-h-[2.5rem] !text-sm"
                />
              </div>
              <div>
                <label className="field-hint">ရေချိုးနည်း</label>
                <select
                  value={hygiene.bathType}
                  onChange={(e) => setHygiene({ ...hygiene, bathType: e.target.value as any })}
                  className="select !min-h-[2.5rem] !text-sm"
                >
                  <option value="">ရွေးချယ်ပါ</option>
                  <option value="bath">ရေချိုးခြင်း</option>
                  <option value="sponge_bath">ရေပတ်တိုက်ခြင်း</option>
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">Diaper လဲလှယ်ချိန် (အကိမ်ရေ)</label>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={hygiene.diaperChanges}
                onChange={(e) => setHygiene({ ...hygiene, diaperChanges: parseInt(e.target.value) || 0 })}
                className="input !text-sm"
              />
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={hygiene.rashCheck}
                onChange={(e) => setHygiene({ ...hygiene, rashCheck: e.target.checked })}
              />
              <span className="text-sm">ဆီးပူ/ဝမ်းပူမိခြင်း ရှိ</span>
            </label>
          </div>
        );

      case 'sleep':
        return (
          <div className="space-y-3">
            {sleepRecords.map((record, index) => (
              <div key={index} className="record-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">#{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSleepRecord(index)}
                    className="btn btn-ghost btn-icon !min-h-8 !min-w-8 text-red-500 hover:!bg-red-50"
                    aria-label="ဖျက်ရန်"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-hint">အမျိုးအစား</label>
                    <select
                      value={record.type}
                      onChange={(e) => updateSleepRecord(index, 'type', e.target.value)}
                      className="select !min-h-[2.5rem] !text-sm"
                    >
                      <option value="day">နေ့ဘက်</option>
                      <option value="night">ညဘက်</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-hint">အချိန်သတ်မှတ်</label>
                    <select
                      value={record.onSchedule.toString()}
                      onChange={(e) => updateSleepRecord(index, 'onSchedule', e.target.value === 'true')}
                      className="select !min-h-[2.5rem] !text-sm"
                    >
                      <option value="true">အချိန်မှန်</option>
                      <option value="false">အချိန်မမှန်</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-hint">အိပ်ချိန်</label>
                    <input
                      type="time"
                      value={record.startTime}
                      onChange={(e) => updateSleepRecord(index, 'startTime', e.target.value)}
                      className="input !min-h-[2.5rem] !text-sm"
                    />
                  </div>
                  <div>
                    <label className="field-hint">နိုးချိန်</label>
                    <input
                      type="time"
                      value={record.endTime}
                      onChange={(e) => updateSleepRecord(index, 'endTime', e.target.value)}
                      className="input !min-h-[2.5rem] !text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addSleepRecord} className="add-btn">
              <Plus size={18} />
              အိပ်ချိန် ထည့်ရန်
            </button>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="record-card flex items-end gap-2">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-hint">အမျိုးအစား</label>
                    <select
                      value={activity.type}
                      onChange={(e) => updateActivity(index, 'type', e.target.value)}
                      className="select !min-h-[2.5rem] !text-sm"
                    >
                      <option value="exercise">လေ့ကျင့်ခန်း</option>
                      <option value="flash_cards">Flash Card</option>
                      <option value="story_reading">ပုံပြင်ဖတ်ခြင်း</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-hint">အချိန်</label>
                    <input
                      type="time"
                      value={activity.time}
                      onChange={(e) => updateActivity(index, 'time', e.target.value)}
                      className="input !min-h-[2.5rem] !text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeActivity(index)}
                  className="btn btn-ghost btn-icon !min-h-[2.5rem] text-red-500 hover:!bg-red-50 shrink-0"
                  aria-label="ဖျက်ရန်"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button type="button" onClick={addActivity} className="add-btn">
              <Plus size={18} />
              လှုပ်ရှားမှု ထည့်ရန်
            </button>
          </div>
        );

      case 'abnormalities':
        return (
          <textarea
            value={abnormalities}
            onChange={(e) => setAbnormalities(e.target.value)}
            placeholder="ကလေးတွင် ပုံမှန်မဟုတ်သည့် ထူးခြားဖြစ်စဉ်များ (ဖျားနာခြင်း၊ အနီစက်ထွက်ခြင်း၊ မှုတ်နေခြင်း) ရှိပါက ရေးသားပါ"
            rows={6}
            className="textarea !text-sm"
          />
        );

      default:
        return null;
    }
  };

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

  const reportDate = new Date(report.date).toLocaleDateString('my-MM', {
    month: 'short',
    day: 'numeric',
  });

  const currentSection = sections.find(s => s.id === openSection);

  // Modal view
  if (openSection && currentSection) {
    const Icon = currentSection.icon;
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenSection(null)}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-primary"><Icon size={20} /></span>
            <h2 className="font-bold text-slate-900">{currentSection.title}</h2>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
          {renderSectionContent()}
        </div>

        {/* Modal Bottom Bar */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpenSection(null)}
              className="btn btn-secondary flex-1"
            >
              ပြီးပြီ
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={updateMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {updateMutation.isPending ? (
                <Loader2 className="spinner" size={18} />
              ) : (
                <Save size={18} />
              )}
              မှတ်ထားရန်
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Title list view
  return (
    <PageShell>
      <PageHeader
        title="နေ့စဉ် Report"
        subtitle={`${report.childName} · ${reportDate}`}
        onBack={() => navigate('/')}
      />

      <main className="app-container py-5 space-y-3 pb-28">
        <p className="text-sm text-slate-500 mb-2">ဖြည့်ဆည်းလိုသည့် အပိုင်းကို နှိပ်ပါ</p>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setOpenSection(section.id)}
              className="w-full card px-4 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <span className="flex-1 font-semibold text-slate-800">{section.title}</span>
              {section.filled ? (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
              )}
            </button>
          );
        })}
      </main>

      {/* Bottom Actions */}
      <BottomBar>
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={updateMutation.isPending}
          className="btn btn-secondary flex-1"
        >
          <Save size={18} />
          မှတ်ထားရန်
        </button>
        <button
          type="button"
          onClick={() => handleSave('submitted')}
          disabled={updateMutation.isPending}
          className="btn btn-primary flex-1"
        >
          {updateMutation.isPending ? (
            <Loader2 className="spinner" size={18} />
          ) : (
            <Send size={18} />
          )}
          ပေးပို့ရန်
        </button>
      </BottomBar>
    </PageShell>
  );
};

export default NAReportForm;
