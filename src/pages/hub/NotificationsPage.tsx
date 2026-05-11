import React from 'react';
import { Bell, Info, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: '1',
      title: 'Welcome to FlowForge',
      message: 'Start your first project by clicking the New Project button.',
      time: 'Just now',
      type: 'info',
      icon: Info,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      id: '2',
      title: 'AI Ready',
      message: 'The intake engine is now connected to Gemini AI for smarter suggestions.',
      time: '2 hours ago',
      type: 'success',
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 font-poppins">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className={`${n.bg} border border-slate-100 rounded-2xl p-6 flex gap-4 transition-transform hover:scale-[1.01]`}>
            <div className={`${n.color} shrink-0`}>
              <n.icon size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900">{n.title}</h3>
                <span className="text-xs text-slate-400 font-medium">{n.time}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-2xl">
            <Bell size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No new notifications</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => navigate('/hub')}>
          Back to Hub
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;
