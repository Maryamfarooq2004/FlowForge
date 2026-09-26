import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { Bell, HelpCircle, CheckCircle2, AlertTriangle, Save, Eye, ImageOff } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useThemePresets, useProjectTheme, useSaveTheme } from '../../hooks/useTheme';
import { contrastRatio } from '../../utils/contrast';
import { ALLOWED_FONTS } from '../../types/theme.types';
import type { ThemeColors, ThemeFonts } from '../../types/theme.types';

type DomainTab = 'clinic' | 'school' | 'all';

const ThemeStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const { data: presets = [] } = useThemePresets();
  const { data: savedTheme } = useProjectTheme(projectId);
  const save = useSaveTheme(projectId);

  const [colors, setColors] = useState<ThemeColors>({ primary: '#0F766E', secondary: '#4F46E5', accent: '#34D399' });
  const [fonts, setFonts] = useState<ThemeFonts>({ heading: 'Poppins', body: 'Inter' });
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<DomainTab>('all');

  // Seed from the saved theme (or domain default) once it loads.
  useEffect(() => {
    if (savedTheme) {
      setColors(savedTheme.colors);
      setFonts(savedTheme.fonts);
      setPresetKey(savedTheme.presetKey);
    }
  }, [savedTheme]);

  // Default the gallery tab to the project's domain.
  useEffect(() => {
    if (project?.domain === 'clinic' || project?.domain === 'school') setTab(project.domain);
  }, [project?.domain]);

  const applyPreset = (key: string) => {
    const p = presets.find((x) => x.key === key);
    if (!p) return;
    setColors(p.colors);
    setFonts(p.fonts);
    setPresetKey(p.key);
  };

  const setColor = (role: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [role]: value }));
    setPresetKey(undefined); // manual edit → custom
  };
  const setFont = (role: keyof ThemeFonts, value: string) => {
    setFonts((prev) => ({ ...prev, [role]: value }));
    setPresetKey(undefined);
  };

  const ratio = useMemo(() => contrastRatio(colors.primary, '#FFFFFF'), [colors.primary]);
  const aa = ratio >= 4.5;

  const visiblePresets = tab === 'all' ? presets : presets.filter((p) => p.domain === tab);

  const handleSave = () => save.mutate({ colors, fonts, presetKey });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">Project: {project?.name || 'My Organization'}</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Theme Studio</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/project/${projectId}/preview`)}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
          >
            <Eye size={16} /> Preview App
          </button>
          <button onClick={() => navigate('/hub/notifications')} className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <button onClick={() => navigate('/hub/support')} className="text-white/70 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main: preset gallery */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-[24px] font-bold text-slate-900 font-poppins">Choose a Theme for Your App</h1>
                <p className="text-sm text-slate-500 mt-1">Pick a preset or fine-tune your brand on the right. Changes apply to your live Preview.</p>
              </div>
              <div className="flex space-x-6 border-b border-slate-200">
                {(['clinic', 'school', 'all'] as DomainTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'pb-2 text-sm font-bold capitalize border-b-2 transition-colors',
                      tab === t ? 'text-[#0F766E] border-[#0F766E]' : 'text-slate-400 hover:text-slate-700 border-transparent'
                    )}
                  >
                    {t === 'all' ? 'All' : `${t} Themes`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePresets.map((p) => {
                const selected = presetKey === p.key;
                return (
                  <div
                    key={p.key}
                    onClick={() => applyPreset(p.key)}
                    className={cn(
                      'rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 relative bg-white flex flex-col h-56',
                      selected ? 'border-[#0F766E] shadow-xl shadow-teal-900/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    )}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#0F766E] rounded-full flex items-center justify-center text-white z-10 shadow-md">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </div>
                    )}
                    <div className="h-24 w-full shrink-0 relative" style={{ backgroundColor: p.colors.primary }}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex gap-2">
                        <span className="w-5 h-5 rounded-full border-2 border-white/70" style={{ backgroundColor: p.colors.secondary }} />
                        <span className="w-5 h-5 rounded-full border-2 border-white/70" style={{ backgroundColor: p.colors.accent }} />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="font-semibold text-slate-800 text-sm" style={{ fontFamily: p.fonts.heading }}>{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{p.domain} · {p.fonts.heading}/{p.fonts.body}</p>
                      <div className="mt-3 flex-1 bg-slate-50 rounded-lg border border-slate-100 p-2 flex flex-col gap-2">
                        <div className="h-2 w-full rounded-full opacity-30" style={{ backgroundColor: p.colors.primary }} />
                        <div className="flex gap-2">
                          <div className="w-3 h-8 rounded-sm opacity-20" style={{ backgroundColor: p.colors.secondary }} />
                          <div className="flex-1 flex flex-col gap-1.5">
                            <div className="h-3 w-12 rounded-sm" style={{ backgroundColor: p.colors.primary }} />
                            <div className="h-1 w-full rounded-sm opacity-20" style={{ backgroundColor: p.colors.accent }} />
                            <div className="h-1 w-2/3 rounded-sm opacity-20" style={{ backgroundColor: p.colors.accent }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right: customization */}
        <aside className="w-full lg:w-80 bg-white border-l border-slate-200 shrink-0 flex flex-col overflow-y-auto">
          <div className="p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-6">Customize Your Brand</h2>

            {/* Colors */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">Brand Colors</h3>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1',
                  aa ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}>
                  {aa ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                  {aa ? `AA ${ratio.toFixed(1)}:1` : `Low contrast ${ratio.toFixed(1)}:1`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['primary', 'secondary', 'accent'] as (keyof ThemeColors)[]).map((role) => (
                  <div key={role}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{role}</label>
                    <div className="h-10 rounded-lg shadow-inner cursor-pointer relative" style={{ backgroundColor: colors[role] }}>
                      <input
                        type="color"
                        value={colors[role]}
                        onChange={(e) => setColor(role, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 text-center">{colors[role].toUpperCase()}</p>
                  </div>
                ))}
              </div>
              {!aa && (
                <p className="text-[11px] text-amber-600 mt-2">White button text on the primary color may be hard to read (WCAG AA needs ≥ 4.5:1).</p>
              )}
            </div>

            {/* Fonts */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Typography</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Heading Font</label>
                  <select
                    value={fonts.heading}
                    onChange={(e) => setFont('heading', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#0F766E] cursor-pointer"
                  >
                    {ALLOWED_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Body Font</label>
                  <select
                    value={fonts.body}
                    onChange={(e) => setFont('body', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#0F766E] cursor-pointer"
                  >
                    {ALLOWED_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Live Preview</h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 h-44 overflow-hidden shadow-inner flex flex-col">
                <div className="h-5 rounded-md w-full mb-3 flex items-center px-2" style={{ backgroundColor: colors.primary }}>
                  <span className="text-white text-[9px] font-bold" style={{ fontFamily: fonts.heading }}>{project?.name || 'Your App'}</span>
                </div>
                <div className="flex gap-3 flex-1">
                  <div className="w-6 h-full rounded-md opacity-20" style={{ backgroundColor: colors.secondary }} />
                  <div className="flex-1 bg-white border border-slate-100 rounded-md p-2 flex flex-col gap-2">
                    <div className="text-[10px] font-bold" style={{ color: colors.primary, fontFamily: fonts.heading }}>Dashboard</div>
                    <div className="text-[8px] text-slate-500 leading-tight" style={{ fontFamily: fonts.body }}>The quick brown fox jumps over the lazy dog.</div>
                    <div className="mt-auto flex justify-end">
                      <div className="h-4 px-2 rounded text-white text-[8px] font-bold flex items-center" style={{ backgroundColor: colors.accent }}>Action</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo extraction — deferred */}
            <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <ImageOff size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600">Auto-extract from logo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Pulling brand colors from your uploaded logo is coming soon.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
            <Button
              onClick={handleSave}
              isLoading={save.isPending}
              className="w-full h-12 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-teal-900/10"
              style={{ backgroundColor: colors.primary }}
            >
              <Save size={18} />
              <span>Save Theme</span>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ThemeStudioPage;
