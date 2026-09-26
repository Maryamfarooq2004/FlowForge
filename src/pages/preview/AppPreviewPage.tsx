import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { ChevronDown, Lock, RotateCw, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useProject } from '../../hooks/useProjects';
import { usePreviewState, useSetRole, useResetSandbox } from '../../hooks/usePreview';
import type { ApiError } from '../../types/global.types';
import { GeneratedAppLogin } from '../../features/preview/components/GeneratedAppLogin';
import { PreviewRuntime } from '../../features/preview/renderer/PreviewRuntime';

const AppPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { data: project } = useProject(projectId);

  const stateQuery = usePreviewState(projectId);
  const setRole = useSetRole(projectId);
  const reset = useResetSandbox(projectId);

  const state = stateQuery.data;
  const meta = state?.meta;

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'login' | 'app'>('app');

  const appName = meta?.appLabel || project?.name || 'My App';
  const activeRoleName = meta?.roles.find((r) => r.key === state?.activeRoleKey)?.name ?? '—';
  const urlPath =
    previewMode === 'login'
      ? 'app.preview.flowforge.app/login'
      : `app.preview.flowforge.app/${appName.toLowerCase().replace(/\s+/g, '-')}`;

  const errStatus = (stateQuery.error as ApiError | null)?.response?.status;
  const errMessage = (stateQuery.error as ApiError | null)?.response?.data?.message;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-inter">
      {/* Platform Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6 w-1/3">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">{project?.name || 'My Project'}</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Preview App</span>
          </div>
        </div>

        {/* Role Switcher (populated from the spec's roles) */}
        <div className="flex justify-center w-1/3 relative">
          <button
            onClick={() => setRoleMenuOpen((p) => !p)}
            disabled={!meta}
            className="bg-teal-700/50 hover:bg-teal-700 rounded-lg px-4 py-1.5 flex items-center space-x-3 transition-colors border border-teal-600/50 disabled:opacity-50"
          >
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-bold text-teal-300 uppercase tracking-widest leading-none">VIEWING AS:</span>
              <span className="text-sm font-medium text-white leading-tight">{activeRoleName}</span>
            </div>
            <ChevronDown size={14} className="text-teal-300" />
          </button>
          {roleMenuOpen && meta && (
            <div className="absolute top-10 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden w-52">
              {meta.roles.map((role) => (
                <button
                  key={role.key}
                  onClick={() => {
                    setRole.mutate(role.key);
                    setRoleMenuOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm font-medium transition-colors',
                    state?.activeRoleKey === role.key ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {role.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 w-1/3">
          <button
            onClick={() => reset.mutate()}
            disabled={!meta || reset.isPending}
            className="text-xs font-bold text-white border border-white/20 hover:bg-white/10 rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RotateCw size={14} className={reset.isPending ? 'animate-spin' : ''} />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={() => navigate(`/project/${projectId}/theme`)}
            className="text-xs font-bold text-white border border-white/20 hover:bg-white/10 rounded-lg px-4 py-2 transition-colors"
          >
            Theme
          </button>
          <button
            onClick={() => navigate(`/project/${projectId}/artifacts`)}
            className="text-xs font-bold text-white border border-white/20 hover:bg-white/10 rounded-lg px-4 py-2 transition-colors"
          >
            View Code
          </button>
          <Button
            onClick={() => navigate(`/project/${projectId}/deploy`)}
            className="bg-[#0F766E] hover:bg-[#0D6B63] text-white text-xs font-bold px-5 py-2 h-auto rounded-lg"
          >
            Deploy
          </Button>
        </div>
      </nav>

      {/* Split Pane Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Browser Chrome & App */}
        <div className="flex-1 flex flex-col bg-[#F1F5F9] p-4 lg:p-6 pb-0 overflow-hidden relative">
          {/* Browser Chrome Strip */}
          <div className="bg-[#E2E8F0] rounded-t-xl flex items-center px-4 py-2.5 space-x-4 border border-b-0 border-slate-300 shadow-sm shrink-0">
            <div className="flex space-x-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-md px-3 py-1 flex items-center space-x-2 max-w-xl w-full border border-slate-200 shadow-inner">
                <Lock size={12} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-600 truncate font-mono">{urlPath}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-slate-200 p-1 rounded-lg flex space-x-1">
                {(['login', 'app'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={cn(
                      'px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors',
                      previewMode === mode ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated App Viewport */}
          <div className="flex-1 bg-white border border-slate-300 border-t-0 shadow-xl overflow-hidden flex flex-col relative rounded-b-xl">
            {stateQuery.isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="animate-spin text-[#0F766E]" size={28} />
                <p className="text-sm">Preparing your preview…</p>
              </div>
            )}

            {stateQuery.isError && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                <AlertTriangle size={30} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  {errStatus === 400 ? 'Approve your blueprint first' : errStatus === 404 ? 'Nothing to preview yet' : "Couldn't load the preview"}
                </h2>
                <p className="text-sm text-slate-500 max-w-md">{errMessage || 'Complete the blueprint and code generation, then come back.'}</p>
                <Button onClick={() => navigate(`/project/${projectId}/spec`)} className="bg-[#0F766E] text-white mt-2">
                  Go to blueprint
                </Button>
              </div>
            )}

            {state && meta && previewMode === 'login' && (
              <GeneratedAppLogin
                appName={appName}
                appTheme="teal"
                roles={meta.roles}
                activeRoleKey={state.activeRoleKey}
                isSwitching={setRole.isPending}
                onLogin={(roleKey) => {
                  setRole.mutate(roleKey, { onSuccess: () => setPreviewMode('app') });
                }}
              />
            )}
            {state && meta && previewMode === 'app' && <PreviewRuntime projectId={projectId!} state={state} />}
          </div>
        </div>

        {/* Right Pane - UI Assistant (disabled placeholder — arrives in a later phase) */}
        <aside className="w-[340px] bg-white border-l border-slate-200 shrink-0 flex flex-col">
          <div className="p-5 border-b border-slate-100 shadow-sm relative z-10 bg-white">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="font-bold text-slate-800 text-lg">UI Assistant</h2>
              <Sparkles size={18} className="text-teal-500" />
            </div>
            <p className="text-xs text-slate-500">Describe UI changes in plain language</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <Sparkles size={28} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">AI UI Assistant</p>
            <p className="text-xs text-slate-400 mt-1">Conversational UI editing arrives in a later phase.</p>
          </div>
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="relative opacity-60">
              <input
                type="text"
                disabled
                placeholder="Describe a UI change… (coming soon)"
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed px-2">
              To change data or logic, edit the <strong className="text-slate-500">WorkflowSpec</strong> and regenerate.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AppPreviewPage;
