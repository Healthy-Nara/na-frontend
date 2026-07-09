import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { naLogin, fetchNAMe } from '../api';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, User as UserIcon, Loader2, Eye, EyeOff, Heart } from 'lucide-react';
import { PageShell, LoadingScreen } from '../components/ui/Layout';

const NALogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNA, setIsNA] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkNA = async () => {
      const token = localStorage.getItem('na_token');
      if (token) {
        try {
          await fetchNAMe();
          setIsNA(true);
        } catch {
          localStorage.removeItem('na_token');
          setIsNA(false);
        }
      } else {
        setIsNA(false);
      }
    };
    checkNA();
  }, []);

  const mutation = useMutation({
    mutationFn: naLogin,
    onSuccess: (data) => {
      localStorage.setItem('na_token', data.token);
      localStorage.setItem('na_user', JSON.stringify(data.caregiver));
      navigate('/');
    },
    onError: (err: any) => {
      setError(err.message || 'ဝင်ရောက်၍ မရပါ');
    },
  });

  if (isNA === true) {
    return <Navigate to="/" />;
  }

  if (isNA === null) {
    return <LoadingScreen />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ username, password });
  };

  return (
    <PageShell>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 safe-bottom">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-5">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl scale-110" />
              <div className="relative bg-gradient-to-br from-primary-light to-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Heart className="text-white h-8 w-8" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Healthy Nara</h1>
            <p className="text-slate-500 mt-1.5 text-sm">NA ဝန်ထမ်း ဝင်ရောက်ရန်</p>
          </div>

          {/* Form Card */}
          <div className="card card-section">
            {error && (
              <div className="alert alert-error mb-5" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="field-label" htmlFor="username">အမည် (Username)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-[1.125rem] w-[1.125rem] text-slate-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="input input-with-icon"
                    placeholder="username ထည့်ပါ"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="password">မှတ်ပုံတင်နံပါတ် (NRC)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[1.125rem] w-[1.125rem] text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input input-with-icon input-with-icon-right"
                    placeholder="NRC ဂဏန်းများထည့်ပါ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors"
                    aria-label={showPassword ? 'စကားဝှက် ဖျောက်ရန်' : 'စကားဝှက် ပြရန်'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn btn-primary btn-full mt-2"
              >
                {mutation.isPending ? (
                  <Loader2 className="spinner h-5 w-5" />
                ) : null}
                ဝင်ရောက်ရန်
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            &copy; 2026 Healthy Nara. All rights reserved.
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default NALogin;
