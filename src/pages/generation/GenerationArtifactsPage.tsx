import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, HelpCircle, Terminal, Package, Book, LifeBuoy,
  Download, Copy, X, FileText, Folder, FolderOpen, ChevronRight,
  FileCode2, FileJson, Database, Loader2, AlertTriangle, Eye, Rocket,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useLatestRun } from '../../hooks/useGeneration';
import type { GenerationArtifact } from '../../types/generation.types';

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  lang?: string;
  size?: number;
  contents?: string;
  path?: string;
}

const buildTree = (artifacts: GenerationArtifact[]): TreeNode[] => {
  const root: TreeNode = { name: '', type: 'folder', children: [] };
  for (const a of artifacts) {
    const parts = a.path.split('/');
    let node = root;
    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;
      let child = node.children!.find((c) => c.name === part && (isFile ? c.type === 'file' : c.type === 'folder'));
      if (!child) {
        child = isFile
          ? { name: part, type: 'file', lang: a.lang, size: a.size, contents: a.contents, path: a.path }
          : { name: part, type: 'folder', children: [] };
        node.children!.push(child);
      }
      node = child;
    });
  }
  const sortNode = (n: TreeNode) => {
    if (!n.children) return;
    n.children.sort((x, y) => (x.type === y.type ? x.name.localeCompare(y.name) : x.type === 'folder' ? -1 : 1));
    n.children.forEach(sortNode);
  };
  sortNode(root);
  return root.children ?? [];
};

const FileIcon: React.FC<{ node: TreeNode; isOpen?: boolean }> = ({ node, isOpen }) => {
  if (node.type === 'folder') {
    return isOpen ? <FolderOpen size={14} className="text-amber-400 shrink-0" /> : <Folder size={14} className="text-amber-400 shrink-0" />;
  }
  if (node.lang === 'json') return <FileJson size={14} className="text-amber-500 shrink-0" />;
  if (node.lang === 'sql') return <Database size={14} className="text-blue-400 shrink-0" />;
  if (node.lang === 'ts' || node.lang === 'tsx' || node.lang === 'js') return <FileCode2 size={14} className="text-blue-500 shrink-0" />;
  return <FileText size={14} className="text-slate-400 shrink-0" />;
};

const TreeNodeComponent: React.FC<{
  node: TreeNode;
  depth?: number;
  onSelectFile: (n: TreeNode) => void;
  selected: TreeNode | null;
}> = ({ node, depth = 0, onSelectFile, selected }) => {
  const [open, setOpen] = useState(depth < 2);

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-1.5 w-full text-left py-1 px-2 hover:bg-slate-50 rounded-md transition-colors"
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <ChevronRight size={12} className={cn('text-slate-400 transition-transform shrink-0', open && 'rotate-90')} />
          <FileIcon node={node} isOpen={open} />
          <span className="text-xs font-semibold text-slate-700">{node.name}</span>
          {node.children && <span className="text-[10px] text-slate-400 ml-auto">{node.children.length}</span>}
        </button>
        <AnimatePresence>
          {open && node.children && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
              {node.children.map((child, i) => (
                <TreeNodeComponent key={i} node={child} depth={depth + 1} onSelectFile={onSelectFile} selected={selected} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node)}
      className={cn(
        'flex items-center gap-1.5 w-full text-left py-1 px-2 rounded-md transition-colors text-xs',
        selected?.path === node.path ? 'bg-teal-50 text-[#0F766E] font-semibold' : 'text-slate-600 hover:bg-slate-50'
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <FileIcon node={node} />
      {node.name}
    </button>
  );
};

const langColors: Record<string, string> = {
  json: 'text-amber-300', sql: 'text-blue-300', ts: 'text-sky-300', tsx: 'text-sky-300',
  js: 'text-yellow-200', yaml: 'text-green-300', md: 'text-slate-300', text: 'text-slate-300',
};

const fmtBytes = (n: number) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`);

const GenerationArtifactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const { data: run, isLoading, isError } = useLatestRun(projectId);

  const [selected, setSelected] = useState<TreeNode | null>(null);
  const [copied, setCopied] = useState(false);

  const artifacts = run?.artifacts ?? [];
  const tree = useMemo(() => buildTree(artifacts), [artifacts]);
  const totalBytes = useMemo(() => artifacts.reduce((s, a) => s + a.size, 0), [artifacts]);

  const handleCopy = () => {
    if (selected?.contents) {
      navigator.clipboard.writeText(selected.contents);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">{project?.name || 'Project'}</span>
            <span className="text-white/30">›</span>
            <span className="text-white">Artifacts</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white"><Bell size={20} /></button>
          <button className="text-white/70 hover:text-white"><HelpCircle size={20} /></button>
          <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate(`/project/${projectId}/generating`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Terminal size={16} /><span>Progress</span>
            </button>
            <button
              onClick={() => navigate(`/project/${projectId}/logs`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Book size={16} /><span>Logs</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 bg-teal-50 text-[#0F766E] font-bold rounded-lg text-sm border-l-2 border-[#0F766E]">
              <Package size={16} /><span>Artifacts</span>
            </button>
            <button
              onClick={() => navigate(`/project/${projectId}/preview`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye size={16} /><span>Preview</span>
            </button>
            <button
              onClick={() => navigate(`/project/${projectId}/deploy`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Rocket size={16} /><span>Deploy</span>
            </button>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-sm transition-colors">
              <LifeBuoy size={14} /><span>Support</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-poppins">Generated Backend — {project?.name || 'Project'}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Real Node/Express + PostgreSQL + Sequelize source, generated from your approved blueprint.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {run?.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/project/${projectId}/preview`)}
                    className="flex items-center gap-2 h-10 px-5 bg-[#0F766E] hover:bg-[#0D6B63] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    <Eye size={15} />Preview App
                  </button>
                )}
                {run?.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/project/${projectId}/deploy`)}
                    className="flex items-center gap-2 h-10 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Download size={15} />Deploy &amp; Export
                  </button>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={18} /> Loading artifacts…
              </div>
            )}
            {isError && !run && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <AlertTriangle size={28} className="text-amber-500" />
                <p>No generated backend yet for this project.</p>
                <button onClick={() => navigate(`/project/${projectId}/generating`)} className="text-[#0F766E] font-semibold text-sm hover:underline">
                  Start a build →
                </button>
              </div>
            )}
            {run && run.status !== 'completed' && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="animate-spin text-[#0F766E]" size={22} />
                <p>Generation is still in progress ({run.percent}%).</p>
                <button onClick={() => navigate(`/project/${projectId}/generating`)} className="text-[#0F766E] font-semibold text-sm hover:underline">
                  View progress →
                </button>
              </div>
            )}

            {run && run.status === 'completed' && (
              <>
                <div className="flex gap-5">
                  <div className={cn('bg-white border border-slate-200 rounded-2xl shadow-sm p-4 overflow-y-auto max-h-[70vh] transition-all', selected ? 'w-2/5' : 'w-full')}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Project Files</p>
                    {tree.map((node, i) => (
                      <TreeNodeComponent key={i} node={node} depth={0} onSelectFile={setSelected} selected={selected} />
                    ))}
                  </div>

                  <AnimatePresence>
                    {selected && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 bg-[#0F172A] rounded-xl overflow-hidden flex flex-col max-h-[70vh]"
                      >
                        <div className="flex items-center justify-between px-4 py-3 bg-[#0A1020] border-b border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileIcon node={selected} />
                            <span className="text-xs font-semibold text-slate-300 truncate">{selected.path}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                              <Copy size={12} />{copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white transition-colors ml-2">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <pre className={cn('p-5 font-mono text-xs overflow-auto flex-1 leading-relaxed whitespace-pre', langColors[selected.lang || 'text'])}>
                          {selected.contents}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap gap-6 mt-6 text-sm text-slate-500">
                  <span>📄 <strong className="text-slate-700">{run.stats?.files ?? artifacts.length}</strong> files</span>
                  <span>🧩 <strong className="text-slate-700">{run.stats?.entities ?? 0}</strong> entities</span>
                  <span>🔌 <strong className="text-slate-700">{run.stats?.endpoints ?? 0}</strong> endpoints</span>
                  <span>📦 <strong className="text-slate-700">{fmtBytes(totalBytes)}</strong></span>
                  {run.stats?.durationMs ? <span>⚡ <strong className="text-slate-700">{(run.stats.durationMs / 1000).toFixed(1)}s</strong></span> : null}
                  <span>🔑 <strong className="text-slate-700">MIT</strong></span>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerationArtifactsPage;
