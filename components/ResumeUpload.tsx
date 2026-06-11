'use client';
import { useState, useCallback } from 'react';
import { Upload, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface ResumeUploadProps {
  jobTitle: string;
  jdKeywords: string[];
  onSubmit: (resumeText: string) => void;
  onBack: () => void;
}

export function ResumeUpload({ jobTitle, jdKeywords, onSubmit, onBack }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('application/pdf')) {
      setError('只支持PDF格式的简历');
      return;
    }

    setError('');
    setFile(selectedFile);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResumeText(data.text);
      } else {
        setError(data.error || '解析简历失败');
      }
    } catch (err) {
      setError('解析简历失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim()) {
      onSubmit(resumeText.trim());
    }
  };

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
          <h2 className="text-2xl font-bold text-foreground mb-1">上传简历</h2>
          <p className="text-muted-foreground">岗位：{jobTitle}</p>
        </div>
      </div>

      {jdKeywords.length > 0 && (
        <div className="bg-primary/5 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-primary mb-2">JD关键词</h3>
          <div className="flex flex-wrap gap-2">
            {jdKeywords.slice(0, 10).map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {keyword}
              </span>
            ))}
            {jdKeywords.length > 10 && (
              <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                +{jdKeywords.length - 10}
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            上传PDF简历
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              error ? 'border-destructive' : 'border-input hover:border-primary'
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isLoading ? 'bg-muted' : 'bg-primary/10'
              }`}>
                {isLoading ? (
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {file ? file.name : '点击或拖拽上传简历'}
                </p>
                <p className="text-sm text-muted-foreground">支持PDF格式</p>
              </div>
            </div>
          </div>
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </div>

        <div>
          <label htmlFor="resumeText" className="block text-sm font-medium text-foreground mb-2">
            简历内容预览（可编辑）
          </label>
          <textarea
            id="resumeText"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="简历内容将显示在这里..."
            className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground min-h-[200px] resize-none"
            disabled={isLoading}
          />
        </div>

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
            disabled={!resumeText.trim() || isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                分析中...
              </>
            ) : (
              <>
                分析匹配度
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
