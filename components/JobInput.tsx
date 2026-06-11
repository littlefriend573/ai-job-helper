'use client';
import { useState } from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';

interface JobInputProps {
  onSubmit: (jobTitle: string) => void;
}

export function JobInput({ onSubmit }: JobInputProps) {
  const [jobTitle, setJobTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitle.trim()) {
      onSubmit(jobTitle.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">输入目标岗位</h2>
        <p className="text-muted-foreground">告诉我们你想要申请的职位名称</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-2">
            岗位名称
          </label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="例如：前端开发工程师、产品经理、数据分析师"
            className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!jobTitle.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一步
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
