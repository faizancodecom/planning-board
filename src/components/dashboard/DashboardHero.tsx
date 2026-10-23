import React from 'react';
import { Plus, Upload, Workflow, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeroProps {
  onNewPlanningBoard: () => void;
  onNewFlowchart: () => void;
  onImportPln: () => void;
  totalPlansCount: number;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  onNewPlanningBoard,
  onNewFlowchart,
  onImportPln,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 sm:p-8 mb-6 shadow-xl">
      {/* Background dot pattern */}
      <div className="absolute inset-0 bg-grid-dots-dark opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
        {/* Left text and action buttons */}
        <div className="flex-1 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Plan, Sketch & Diagram Your Ideas on Board
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed">
            Create freeform <span className="text-blue-400 font-bold">Planning Whiteboards</span> with sticky notes & graphs, or structured <span className="text-violet-400 font-bold">Flowcharts & Logic Diagrams</span> with smart connectors.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-5">
            {/* New Planning Board */}
            <Button
              size="default"
              onClick={onNewPlanningBoard}
              className="gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer transition-transform hover:scale-102"
            >
              <Layout className="w-4 h-4" strokeWidth={2.5} />
              <span>New Planning Board</span>
            </Button>

            {/* New Flowchart */}
            <Button
              size="default"
              onClick={onNewFlowchart}
              className="gap-2 font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 cursor-pointer transition-transform hover:scale-102"
            >
              <Workflow className="w-4 h-4" strokeWidth={2.5} />
              <span>New Flowchart</span>
            </Button>

            {/* Import File */}
            <Button
              variant="outline"
              size="default"
              onClick={onImportPln}
              className="gap-2 border-emerald-700/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-100 cursor-pointer font-bold"
            >
              <Upload className="w-4 h-4 text-emerald-400" strokeWidth={3} />
              <span>Import .pln</span>
            </Button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="w-48 sm:w-64 md:w-72 lg:w-80 shrink-0">
          <img
            src="/Scrum board-rafiki.svg"
            alt="Planning Board Workspace Illustration"
            draggable={false}
            className="w-full h-auto max-h-56 object-contain drop-shadow-2xl select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
