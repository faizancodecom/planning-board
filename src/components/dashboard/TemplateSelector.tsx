import React from 'react';
import { TEMPLATES } from '@/lib/templates';
import { Sparkles, Plus, Briefcase, GraduationCap, Target, Kanban } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  onSelectBlank: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onSelectBlank,
}) => {
  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'template_business_model_canvas':
        return {
          icon: <Briefcase className="w-4 h-4 text-blue-400" strokeWidth={2.5} />,
          boxClass: 'bg-blue-950/50 border-blue-800/60 text-blue-300',
          badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
          linkClass: 'text-blue-400',
        };
      case 'template_student_study_plan':
        return {
          icon: <GraduationCap className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />,
          boxClass: 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          linkClass: 'text-emerald-400',
        };
      case 'template_swot_analysis':
        return {
          icon: <Target className="w-4 h-4 text-violet-400" strokeWidth={2.5} />,
          boxClass: 'bg-violet-950/50 border-violet-800/60 text-violet-300',
          badgeClass: 'bg-violet-950 text-violet-300 border-violet-800',
          linkClass: 'text-violet-400',
        };
      default:
        return {
          icon: <Kanban className="w-4 h-4 text-amber-400" strokeWidth={2.5} />,
          boxClass: 'bg-amber-950/50 border-amber-800/60 text-amber-300',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
          linkClass: 'text-amber-400',
        };
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={2.5} />
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-300">
            Start from a Template or Blank Board
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Blank Canvas Card */}
        <div
          onClick={onSelectBlank}
          className="group p-4 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 hover:border-sky-500 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-sky-500/10"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors mb-2.5">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-sky-200">Blank Plan</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              Infinite canvas with marker, colorful notes, and charts.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-sky-400 group-hover:text-sky-300 transition-colors">
            + New Canvas
          </span>
        </div>

        {/* Template Cards */}
        {TEMPLATES.map((tmpl) => {
          const cfg = getTemplateIcon(tmpl.id);
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className="group p-4 rounded-xl border-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${cfg.boxClass}`}>
                    {cfg.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${cfg.badgeClass}`}>
                    {tmpl.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-zinc-100">{tmpl.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-snug">
                  {tmpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-2">
                <div className="flex gap-1 overflow-hidden">
                  {tmpl.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[10px] text-zinc-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className={`text-[11px] font-mono font-bold ${cfg.linkClass} group-hover:underline`}>
                  Use Template →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
