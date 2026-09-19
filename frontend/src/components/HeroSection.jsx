import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, BookOpen, Laptop, Sparkles, Smile, ArrowRight } from 'lucide-react';

const SAMPLE_CASES = [
  {
    id: 'case-1',
    label: '34yo Brother (Outdoors & Sci-Fi)',
    icon: Compass,
    color: 'from-blue-500 to-indigo-600',
    description: "My 34-year-old brother. Loves hiking, sci-fi books and board games. We're close. $60 budget. Already has most outdoor gear.",
    name: 'Alex',
    relationship: 'Brother',
    budget: '$60',
    age: '34',
    occasion: 'Birthday',
    badge: 'Case 1'
  },
  {
    id: 'case-2',
    label: 'Mom (Gardening & Mystery)',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    description: "My mom. Early 60s. Gardener, loves cooking and mystery novels. Busy with work. $50-80. Already has kitchen gadgets.",
    name: 'Mom',
    relationship: 'Mother',
    budget: '$50-$80',
    age: '62',
    occasion: 'Mother’s Day',
    badge: 'Case 2'
  },
  {
    id: 'case-3',
    label: 'Coworker (Minimalist Founder)',
    icon: Laptop,
    color: 'from-purple-500 to-violet-600',
    description: "My coworker. Tech startup founder, early 30s, into minimalism. Budget $40. Doesn't like clutter or corporate gifts.",
    name: 'Sam',
    relationship: 'Coworker',
    budget: '$40',
    age: '32',
    occasion: 'Holiday Gift',
    badge: 'Case 3'
  },
  {
    id: 'case-4',
    label: "Friend's 5yo Daughter (STEM & Dino)",
    icon: Smile,
    color: 'from-amber-500 to-orange-600',
    description: "My best friend's 5-year-old daughter. Loves dinosaurs, building blocks and learning. $30. Already has lots of toys.",
    name: 'Mia',
    relationship: "Best Friend's Daughter",
    budget: '$30',
    age: '5',
    occasion: 'Birthday',
    badge: 'Case 4'
  }
];

export default function HeroSection() {
  const { loadSampleCase } = useApp();

  return (
    <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-14 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-200/30 to-rose-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Intelligent Personalized Gift Recommendation Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Find a gift they'll <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            actually love.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Tell us who you're shopping for. GiftBro AI turns their personality, interests, and your budget into thoughtful, non-generic gift ideas.
        </p>

        {/* Quick Sample Test Scenarios */}
        <div className="mt-8 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              ⚡ Try a 1-Click Sample Persona:
            </span>
            <span className="text-xs text-brand-600 font-medium hidden sm:inline">
              Click any scenario to pre-fill instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_CASES.map((sample) => {
              const Icon = sample.icon;
              return (
                <button
                  key={sample.id}
                  onClick={() => loadSampleCase(sample)}
                  className="group relative p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${sample.color} flex items-center justify-center text-white shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-800 transition-colors">
                        {sample.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {sample.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      "{sample.description}"
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-brand-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Budget: {sample.budget}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
