import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { 
  Bell, 
  HelpCircle,
  Search,
  Palette,
  Type,
  LayoutTemplate,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Save,
  Image as ImageIcon
} from 'lucide-react';

const ThemeStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [selectedTheme, setSelectedTheme] = useState('clinical-blue');
  const [primaryColor, setPrimaryColor] = useState('#0F766E');
  const [secondaryColor, setSecondaryColor] = useState('#4F46E5');
  const [accentColor, setAccentColor] = useState('#F59E0B');

  const themes = [
    { id: 'clinical-blue', name: 'Clinical Blue', color: 'bg-blue-600', secondary: 'bg-blue-100' },
    { id: 'warm-care', name: 'Warm Care', color: 'bg-orange-500', secondary: 'bg-orange-100' },
    { id: 'modern-clinic', name: 'Modern Clinic', color: 'bg-teal-500', secondary: 'bg-teal-100' },
    { id: 'school-green', name: 'School Green', color: 'bg-green-500', secondary: 'bg-green-100' },
    { id: 'academic-navy', name: 'Academic Navy', color: 'bg-indigo-800', secondary: 'bg-indigo-100' },
    { id: 'bright-learning', name: 'Bright Learning', color: 'bg-yellow-400', secondary: 'bg-yellow-100' },
  ];

  const handleSave = () => {
    // Navigate to Blueprint Review
    navigate(`/project/${projectId || 'new'}/blueprint`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">Project: My Organization</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Choose Theme</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden lg:block relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search components..." 
            className="w-full bg-white/10 border border-white/20 rounded-full py-1.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <button className="text-white/70 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Studio Tools */}
        <aside className="w-52 bg-white border-r border-slate-200 shrink-0 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg">Studio</h2>
            <p className="text-xs text-slate-400">Theme Editor</p>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600 transition-all text-sm">
              <Palette size={18} />
              <span>Colors</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-all text-sm border-l-4 border-transparent">
              <Type size={18} />
              <span>Typography</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-all text-sm border-l-4 border-transparent">
              <LayoutTemplate size={18} />
              <span>Components</span>
            </button>
          </nav>
        </aside>

        {/* Main Content: Theme Gallery */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-[24px] font-bold text-slate-900 font-poppins">Choose a Theme for Your App</h1>
              <div className="flex space-x-6 border-b border-slate-200">
                <button className="pb-2 text-sm font-bold text-[#0F766E] border-b-2 border-[#0F766E]">Clinic Themes</button>
                <button className="pb-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors border-b-2 border-transparent">School Themes</button>
                <button className="pb-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors border-b-2 border-transparent">All</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 relative bg-white flex flex-col h-56",
                    selectedTheme === theme.id ? "border-[#0F766E] shadow-xl shadow-teal-900/10 scale-[1.02]" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                  )}
                >
                  {selectedTheme === theme.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-[#0F766E] rounded-full flex items-center justify-center text-white z-10 shadow-md">
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                  )}
                  {/* Swatch Header */}
                  <div className={cn("h-24 w-full shrink-0 relative overflow-hidden", theme.color)}>
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                  </div>
                  {/* Body Preview */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-semibold text-slate-800 text-sm mb-3">{theme.name}</p>
                    {/* Tiny UI Layout Mockup */}
                    <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 p-2 flex flex-col gap-2 relative overflow-hidden">
                      {/* Navbar */}
                      <div className={cn("h-2 w-full rounded-full opacity-30", theme.color)}></div>
                      <div className="flex gap-2">
                        {/* Sidebar */}
                        <div className={cn("w-3 h-8 rounded-sm opacity-20", theme.color)}></div>
                        {/* Content */}
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className={cn("h-3 w-12 rounded-sm", theme.color)}></div>
                          <div className={cn("h-1 w-full rounded-sm opacity-20", theme.color)}></div>
                          <div className={cn("h-1 w-2/3 rounded-sm opacity-20", theme.color)}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Suggest Card */}
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center h-56 p-6 text-center group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-teal-600 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <p className="font-bold text-slate-700 text-sm mb-1 uppercase tracking-wider">AI Suggest</p>
                <p className="text-xs text-slate-400">Matching colors to your clinic's vision</p>
              </div>

            </div>
          </div>
        </main>

        {/* Right Panel: Customization */}
        <aside className="w-80 bg-white border-l border-slate-200 shrink-0 flex flex-col overflow-y-auto">
          <div className="p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-6">Customize Your Brand</h2>
            
            {/* Logo Upload */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Logo Upload & Color Extraction</h3>
              <div className="flex gap-3">
                <button className="w-20 h-20 shrink-0 border-2 border-dashed border-teal-400 rounded-xl flex flex-col items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors">
                  <UploadCloud size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">UPLOAD</span>
                </button>
                <div className="flex-1 border border-teal-200 bg-teal-50/30 rounded-xl p-3 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-teal-900 rounded-md flex items-center justify-center text-white shrink-0">
                      <ImageIcon size={12} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">my-org-logo.svg</span>
                  </div>
                  <p className="text-[10px] text-teal-600/70 font-medium">240 KB • Extraction Active</p>
                </div>
              </div>
            </div>

            {/* Auto-extracted */}
            <div className="mb-8 border-b border-slate-100 pb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AUTO-EXTRACTED COLORS</h3>
                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1">
                  <CheckCircle2 size={10} />
                  <span>AA Compliant</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1">
                  <div className="w-4 h-4 rounded-full bg-[#0F766E] shadow-sm"></div>
                  <span className="text-xs font-medium text-slate-600">#0F766E</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1">
                  <div className="w-4 h-4 rounded-full bg-[#4F46E5] shadow-sm"></div>
                  <span className="text-xs font-medium text-slate-600">#4F46E5</span>
                </div>
              </div>
            </div>

            {/* Manual Adjustments */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Manual Adjustments</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">PRIMARY</label>
                  <div className="h-10 rounded-lg bg-[#0F766E] shadow-inner cursor-pointer relative group">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">SECONDARY</label>
                  <div className="h-10 rounded-lg bg-[#4F46E5] shadow-inner cursor-pointer relative group">
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">ACCENT</label>
                  <div className="h-10 rounded-lg bg-[#F59E0B] shadow-inner cursor-pointer relative group">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">HEADING FONT</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#0F766E] appearance-none cursor-pointer">
                    <option>Poppins</option>
                    <option>Inter</option>
                    <option>Outfit</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">BODY FONT</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#0F766E] appearance-none cursor-pointer">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 text-sm">Live Preview</h3>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">REAL-TIME UPDATE</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 h-40 overflow-hidden shadow-inner flex flex-col">
                {/* Navbar mock */}
                <div className="h-4 rounded-md w-full mb-3" style={{ backgroundColor: primaryColor }}></div>
                <div className="flex gap-3 flex-1">
                  {/* Sidebar mock */}
                  <div className="w-6 h-full rounded-md opacity-20" style={{ backgroundColor: secondaryColor }}></div>
                  {/* Content mock */}
                  <div className="flex-1 bg-white border border-slate-100 rounded-md p-2 flex flex-col gap-2">
                    <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    <div className="h-1 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-1 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-1 w-3/4 bg-slate-100 rounded-full"></div>
                    
                    <div className="mt-auto flex justify-end">
                      <div className="h-3 w-8 rounded-sm" style={{ backgroundColor: accentColor }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
            <Button 
              onClick={handleSave}
              className="w-full h-12 bg-[#0F766E] text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-teal-900/10 hover:bg-[#0D6B63] transition-colors"
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
