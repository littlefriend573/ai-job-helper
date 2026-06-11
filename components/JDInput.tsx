'use client';
import { useState } from 'react';
import { FileText, ChevronRight, ChevronLeft, Plus, Trash2 } from 'lucide-react';

interface JDInputProps {
  jobTitle: string;
  onSubmit: (jds: string[]) => void;
  onBack: () => void;
}

export function JDInput({ jobTitle, onSubmit, onBack }: JDInputProps) {
  const [jdItems, setJdItems] = useState<string[]>(['']);

  const handleAddJD = () => {
    if (jdItems.length < 10) {
      setJdItems([...jdItems, '']);
    }
  };

  const handleRemoveJD = (index: number) => {
    if (jdItems.length > 1) {
      setJdItems(jdItems.filter((_, i) => i !== index));
    }
  };

  const handleJdChange = (index: number, value: string) => {
    const newItems = [...jdItems];
    newItems[index] = value;
    setJdItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validJds = jdItems.filter(jd => jd.trim());
    if (validJds.length > 0) {
      onSubmit(validJds);
    }
  };

  const hasValidJd = jdItems.some(jd => jd.trim());

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">粘贴岗位描述</h2>
          <p className="text-muted-foreground">岗位：{jobTitle}</p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <FileText className="w-4 h-4" />
          <span>提示：您可以粘贴多个JD内容，系统会自动分析并提取共同要求</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {jdItems.map((jd, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  JD #{index + 1}
                </span>
                {jdItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveJD(index)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={jd}
                onChange={(e) => handleJdChange(index, e.target.value)}
                placeholder={`请粘贴第 ${index + 1} 个岗位描述(JD)内容...`}
                className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground min-h-[150px] resize-none"
              />
            </div>
          ))}
        </div>

        {jdItems.length < 10 && (
          <button
            type="button"
            onClick={handleAddJD}
            className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground py-3 px-6 rounded-xl font-medium hover:bg-muted/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加JD
          </button>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 bg-muted text-muted-foreground py-3 px-6 rounded-xl font-medium hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            返回
          </button>
          <button
            type="submit"
            disabled={!hasValidJd}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            分析JD ({jdItems.filter(j => j.trim()).length})
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}