import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import {
  Cloud, ExternalLink, Rocket, Download, GitBranch, CheckCircle2, Code2,
  Loader2, AlertTriangle, Package, Terminal,
} from 'lucide-react';
import { useProject } from '../../hooks/useProjects';
import { useDeployment, useDownloadZip, useRecordLiveUrl } from '../../hooks/useDeployment';

const ENV_VARS = [
  { name: 'DATABASE_URL', required: true, note: 'PostgreSQL connection string' },
  { name: 'JWT_SECRET', required: true, note: 'long random string for signing tokens' },
  { name: 'JWT_EXPIRES', required: false, note: 'token lifetime (default 30m)' },
  { name: 'PORT', required: false, note: 'HTTP port (default 4000)' },
];

const DEPLOY_OPTIONS = [
  { name: 'Local (Docker Compose)', steps: 'docker compose up -d db · npm install · npm run migrate · npm run dev' },
  { name: 'Railway', steps: 'New project from repo (railway.json builds the Dockerfile) · add PostgreSQL · run npm run migrate' },
  { name: 'Render', steps: 'New > Blueprint (render.yaml: web + Postgres) · run npm run migrate on first deploy' },
];

const DeploymentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { data: project } = useProject(projectId);

  const { data: deployment, isLoading } = useDeployment(projectId);
  const download = useDownloadZip(projectId);
  const recordUrl = useRecordLiveUrl(projectId);

  const [liveUrl, setLiveUrl] = useState('');

  const statusPill = () => {
    const s = deployment?.status ?? 'none';
    const map = {
      live: { label: 'LIVE', cls: 'bg-emerald-100 text-emerald-700' },
      exported: { label: 'EXPORTED', cls: 'bg-indigo-100 text-indigo-700' },
      none: { label: 'NOT EXPORTED', cls: 'bg-slate-100 text-slate-500' },
    }[s];
    return <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold tracking-wider', map.cls)}>{map.label}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-inter">
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">{project?.name || 'Project'}</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Deploy &amp; Export</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/project/${projectId}/artifacts`)}
          className="text-xs font-bold text-white border border-white/20 hover:bg-white/10 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
        >
          <Code2 size={14} /> View Code
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[32px] font-bold text-slate-900 font-poppins mb-2">Own your source code</h1>
              <p className="text-slate-500 text-sm">
                {project?.name || 'Your project'} — a real Node/Express + PostgreSQL backend, yours to run anywhere.
              </p>
            </div>
            {deployment && statusPill()}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={18} /> Loading…
            </div>
          )}

          {!isLoading && deployment && !deployment.hasBuild && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm flex flex-col items-center text-center gap-3">
              <AlertTriangle size={30} className="text-amber-500" />
              <h2 className="text-lg font-bold text-slate-800">No build to export yet</h2>
              <p className="text-sm text-slate-500 max-w-md">Generate the backend first, then come back to download it.</p>
              <Button onClick={() => navigate(`/project/${projectId}/generating`)} className="bg-[#0F766E] text-white mt-2">
                Generate the app
              </Button>
            </div>
          )}

          {!isLoading && deployment && deployment.hasBuild && (
            <div className="space-y-6">
              {/* Export */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Code2 size={22} className="text-slate-800" />
                  <h2 className="font-semibold text-slate-800 text-lg">Export the source</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Download ZIP */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex gap-5 items-start">
                    <div className="w-14 h-14 bg-[#0F766E] rounded-2xl flex items-center justify-center text-white shrink-0">
                      <Download size={26} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg mb-1">Download ZIP</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {deployment.fileCount} files · Node/Express + PostgreSQL + migrations + Docker.
                      </p>
                      <Button
                        onClick={() => download.mutate()}
                        isLoading={download.isPending}
                        className="bg-[#0F766E] text-white flex items-center gap-2"
                      >
                        <Download size={15} /> Download ZIP
                      </Button>
                      {deployment.exportCount > 0 && (
                        <p className="text-[11px] text-slate-400 mt-2">Exported {deployment.exportCount}×</p>
                      )}
                    </div>
                  </div>

                  {/* Push to GitHub (coming soon) */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex gap-5 items-start opacity-80">
                    <div className="w-14 h-14 bg-slate-400 rounded-2xl flex items-center justify-center text-white shrink-0">
                      <GitBranch size={26} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2">
                        Push to GitHub
                        <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">SOON</span>
                      </h3>
                      <p className="text-sm text-slate-500">One-click repo creation + push is coming in a later release. For now, download the ZIP and push it yourself.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deploy: config + instructions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Rocket size={22} className="text-[#0F766E]" />
                  <h2 className="font-semibold text-slate-800 text-lg">Deploy it anywhere</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  The ZIP ships a <span className="font-mono text-slate-700">Dockerfile</span>, <span className="font-mono text-slate-700">railway.json</span>,{' '}
                  <span className="font-mono text-slate-700">render.yaml</span> and a <span className="font-mono text-slate-700">DEPLOY.md</span>. Pick a host:
                </p>

                <div className="space-y-3 mb-8">
                  {DEPLOY_OPTIONS.map((o) => (
                    <div key={o.name} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <Terminal size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{o.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{o.steps}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Required environment variables</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {ENV_VARS.map((e) => (
                      <div key={e.name} className="flex items-center justify-between px-4 py-2.5">
                        <span className="font-mono text-sm text-slate-800">{e.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{e.note}</span>
                          <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded', e.required ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400')}>
                            {e.required ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Record live URL */}
                <div className="border-t border-slate-100 pt-6">
                  <p className="text-sm font-semibold text-slate-800 mb-1">Deployed it somewhere?</p>
                  <p className="text-xs text-slate-500 mb-3">Paste your live URL to mark this project as Live.</p>
                  {deployment.liveUrl ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <a href={deployment.liveUrl} target="_blank" rel="noreferrer" className="font-mono text-sm text-emerald-800 hover:underline flex-1 truncate">
                        {deployment.liveUrl}
                      </a>
                      <a href={deployment.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-700"><ExternalLink size={15} /></a>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 mt-3">
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://my-clinic-api.up.railway.app"
                      className="flex-1 border border-slate-200 rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                    />
                    <Button
                      onClick={() => liveUrl.trim() && recordUrl.mutate(liveUrl.trim())}
                      isLoading={recordUrl.isPending}
                      disabled={!liveUrl.trim()}
                      className="bg-[#0F766E] text-white flex items-center gap-2 shrink-0"
                    >
                      <Cloud size={15} /> Save URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 px-8 py-6 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="font-bold text-[#0F766E] text-lg font-poppins">FlowForge</span>
          <span className="text-xs text-slate-400 flex items-center gap-1"><Package size={12} /> Generated source is MIT-licensed — it's yours.</span>
        </div>
      </footer>
    </div>
  );
};

export default DeploymentHubPage;
