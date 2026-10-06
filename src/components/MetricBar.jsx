import { Palette, Globe, Layers, Sparkles } from 'lucide-react';

export default function MetricBar() {
  const metrics = [
    {
      title: '100+ Karya Visual',
      desc: 'Eksplorasi desain grafis & video dari tugas, kompetisi, hingga proyek nyata.',
      icon: Palette,
      label: 'Kreativitas',
    },
    {
      title: '10+ Web Selesai',
      desc: 'Aplikasi web fungsional yang sudah dibangun dan berhasil tayang.',
      icon: Globe,
      label: 'Web Dev',
    },
    {
      title: 'Estetika Lintas Media',
      desc: 'Paham ritme visual yang konsisten di poster, motion graphic, maupun antarmuka web.',
      icon: Layers,
      label: 'Kohesif',
    },
    {
      title: 'AI-Assisted Workflow',
      desc: 'Memanfaatkan integrasi AI terbaru agar pengerjaan efisien, terarah, dan minim error.',
      icon: Sparkles,
      label: 'Efisiensi',
    },
  ];

  return (
    <section className="py-8 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 bg-primary-light text-primary border border-primary/20">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
