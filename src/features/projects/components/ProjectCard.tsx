import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Clock, ArrowRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { ProjectStatus } from '../../../components/ui/StatusBadge';
import { cn } from '../../../utils/classNames';

interface ProjectCardProps {
  id: string;
  name: string;
  orgName: string;
  domain: 'clinic' | 'school';
  status: ProjectStatus;
  updatedAt: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  orgName,
  domain,
  status,
  updatedAt,
}) => {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <Badge variant={domain}>{domain === 'clinic' ? 'CLINIC' : 'SCHOOL'}</Badge>
          <StatusBadge status={status} />
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 font-poppins mb-1 leading-tight group-hover:text-[#0F766E] transition-colors">
        {name}
      </h3>
      <p className="text-sm text-slate-500 font-medium mb-4">{orgName}</p>

      <div className="flex items-center text-slate-400 text-xs mb-6">
        <Clock size={14} className="mr-1.5" />
        <span>Updated {updatedAt}</span>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link 
          to={`/project/${id}`} 
          className="text-sm font-bold text-[#0F766E] hover:text-[#0D6B63] flex items-center group/link"
        >
          Open Project 
          <ArrowRight size={16} className="ml-1 transform group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
};
