export const ProjectCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 
                  animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-6 w-16 bg-slate-200 rounded-full" />
      <div className="h-6 w-20 bg-slate-200 rounded-full" />
    </div>
    <div className="h-5 w-3/4 bg-slate-200 rounded-lg mt-4" />
    <div className="h-4 w-1/2 bg-slate-100 rounded-lg mt-2" />
    <div className="flex items-center justify-between mt-6 pt-4 
                    border-t border-slate-100">
      <div className="h-4 w-20 bg-slate-100 rounded" />
      <div className="h-4 w-16 bg-slate-100 rounded" />
    </div>
  </div>
);
