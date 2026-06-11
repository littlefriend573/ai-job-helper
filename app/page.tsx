'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { JobInput } from '@/components/JobInput';
import { JDInput } from '@/components/JDInput';
import { ResumeUpload } from '@/components/ResumeUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Sparkles, Brain, Target, FileText, Settings, AlertCircle } from 'lucide-react';

type Step = 'job' | 'jd' | 'resume' | 'result';

interface JDAnalysis {
  keywords: string[];
  skills: string[];
  requirements: string[];
  capabilityProfile: {
    position?: string;
    technicalSkills: string[];
    softSkills: string[];
    experienceLevel: string;
    educationRequirements: string[];
    frequencyAnalysis?: {
      totalJDs: number;
      keywordFrequency: Record<string, number>;
      skillFrequency: Record<string, number>;
    };
    commonRequirements?: {
      mustHave: string[];
      niceToHave: string[];
    };
  };
}

interface ResumeAnalysis {
  keywords: string[];
  experience: string;
  skills: string[];
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

interface MatchResult {
  score: number;
  suggestions: string[];
}

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>('job');
  const [jobTitle, setJobTitle] = useState('');
  const [jds, setJds] = useState<string[]>([]);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      setAiConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleJobSubmit = (title: string) => {
    setJobTitle(title);
    setStep('jd');
  };

  const handleJDSubmit = async (jdTexts: string[]) => {
    setJds(jdTexts);
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (!aiConfig?.apiKey) {
        setErrorMessage('请先在设置页面配置AI服务商');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: jobTitle, jds: jdTexts, aiConfig }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setJdAnalysis(data);
        setStep('resume');
      } else {
        const data = await response.json();
        setErrorMessage(data.error || '分析JD失败');
      }
    } catch (error) {
      console.error('分析JD失败:', error);
      setErrorMessage('分析JD失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSubmit = async (text: string) => {
    setResumeText(text);
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (!aiConfig?.apiKey) {
        setErrorMessage('请先在设置页面配置AI服务商');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: text, 
          capabilityProfile: jdAnalysis?.capabilityProfile || {},
          aiConfig 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResumeAnalysis(data);
        setMatchResult({
          score: data.score,
          suggestions: data.suggestions
        });
        setStep('result');
      } else {
        const data = await response.json();
        setErrorMessage(data.error || '分析简历失败');
      }
    } catch (error) {
      console.error('分析简历失败:', error);
      setErrorMessage('分析简历失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('job');
    setJobTitle('');
    setJds([]);
    setJdAnalysis(null);
    setResumeText('');
    setResumeAnalysis(null);
    setMatchResult(null);
    setErrorMessage('');
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">AI正在分析...</p>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
          <Link href="/settings" className="text-primary hover:underline">
            前往设置页面配置AI服务商
          </Link>
          <button
            onClick={() => setErrorMessage('')}
            className="ml-4 text-muted-foreground hover:text-foreground"
          >
            重试
          </button>
        </div>
      );
    }

    switch (step) {
      case 'job':
        return <JobInput onSubmit={handleJobSubmit} />;
      case 'jd':
        return (
          <JDInput
            jobTitle={jobTitle}
            onSubmit={handleJDSubmit}
            onBack={() => setStep('job')}
          />
        );
      case 'resume':
        return (
          <ResumeUpload
            jobTitle={jobTitle}
            jdKeywords={jdAnalysis?.keywords || []}
            onSubmit={handleResumeSubmit}
            onBack={() => setStep('jd')}
          />
        );
      case 'result':
        return (
          jdAnalysis && resumeAnalysis && matchResult ? (
            <AnalysisResult
              jobTitle={jobTitle}
              jdAnalysis={jdAnalysis}
              resumeAnalysis={resumeAnalysis}
              matchResult={matchResult}
              onRestart={handleRestart}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">数据加载失败，请重试</p>
              <button
                onClick={handleRestart}
                className="mt-4 text-primary hover:underline"
              >
                返回首页
              </button>
            </div>
          )
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Job Helper</h1>
                <p className="text-xs text-muted-foreground">智能求职助手</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!aiConfig?.apiKey && (
                <span className="text-sm text-amber-600">请配置AI服务商</span>
              )}
              <Link
                href="/settings"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="w-5 h-5" />
                设置
              </Link>
              {step !== 'job' && (
                <button
                  onClick={handleRestart}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  返回首页
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {step === 'job' && (
          <div className="mb-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI分析</h3>
                <p className="text-sm text-muted-foreground">
                  智能分析JD关键词和岗位需求
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">精准匹配</h3>
                <p className="text-sm text-muted-foreground">
                  分析简历与岗位的匹配度
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">优化建议</h3>
                <p className="text-sm text-muted-foreground">
                  提供针对性的简历优化建议
                </p>
              </div>
            </div>
          </div>
        )}

        {renderStep()}
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>AI Job Helper - 智能求职助手</p>
            <p className="mt-1">基于免费大模型API构建</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
