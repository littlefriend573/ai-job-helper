'use client';
import { useState } from 'react';
import { Award, Target, Lightbulb, ArrowRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CapabilityProfile {
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
}

interface JDAnalysis {
  keywords: string[];
  skills: string[];
  requirements: string[];
  capabilityProfile: CapabilityProfile;
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

interface AnalysisResultProps {
  jobTitle: string;
  jdAnalysis: JDAnalysis;
  resumeAnalysis: ResumeAnalysis;
  matchResult: MatchResult;
  onRestart: () => void;
}

export function AnalysisResult({
  jobTitle,
  jdAnalysis,
  resumeAnalysis,
  matchResult,
  onRestart,
}: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<'match' | 'jd' | 'resume'>('match');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">分析结果</h2>
        <p className="text-muted-foreground">岗位：{jobTitle}</p>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 mb-8">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={matchResult.score >= 80 ? '#22c55e' : matchResult.score >= 60 ? '#eab308' : '#ef4444'}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${matchResult.score * 3.52} 352`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(matchResult.score)}`}>
                {matchResult.score}
              </span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">匹配度</h3>
          <p className={`text-lg ${getScoreColor(matchResult.score)}`}>
            {matchResult.score >= 80
              ? '优秀匹配！您非常适合这个岗位'
              : matchResult.score >= 60
              ? '良好匹配！您有一定的竞争力'
              : '需要提升！建议参考优化建议'}
          </p>
          {jdAnalysis.capabilityProfile.frequencyAnalysis && (
            <p className="text-sm text-muted-foreground mt-2">
              基于 {jdAnalysis.capabilityProfile.frequencyAnalysis.totalJDs} 个岗位描述分析
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-muted/50 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('match')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'match'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Target className="w-4 h-4" />
          匹配建议
        </button>
        <button
          onClick={() => setActiveTab('jd')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'jd'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4" />
          岗位画像
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'resume'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          简历分析
        </button>
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'match' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-green-700">已匹配技能</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.matchedSkills.length > 0 ? (
                    resumeAnalysis.matchedSkills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-green-600 text-sm">暂无匹配技能</span>
                  )}
                </div>
                {resumeAnalysis.matchedSkills.length > 6 && (
                  <p className="text-xs text-green-600 mt-2">
                    还有 {resumeAnalysis.matchedSkills.length - 6} 个匹配技能
                  </p>
                )}
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-700">缺失技能</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.missingSkills.length > 0 ? (
                    resumeAnalysis.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-red-600 text-sm">暂无缺失技能</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                简历优化建议
              </h4>
              <div className="space-y-3">
                {matchResult.suggestions.length > 0 ? (
                  matchResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-foreground">
                          {suggestion}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">暂无优化建议</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jd' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">核心技术技能</h4>
              <div className="flex flex-wrap gap-2">
                {jdAnalysis.capabilityProfile.technicalSkills.length > 0 ? (
                  jdAnalysis.capabilityProfile.technicalSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">暂无数据</span>
                )}
              </div>
            </div>

            {jdAnalysis.capabilityProfile.commonRequirements && (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">必备技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {jdAnalysis.capabilityProfile.commonRequirements.mustHave.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">加分技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {jdAnalysis.capabilityProfile.commonRequirements.niceToHave.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">软技能要求</h4>
              <div className="flex flex-wrap gap-2">
                {jdAnalysis.capabilityProfile.softSkills.length > 0 ? (
                  jdAnalysis.capabilityProfile.softSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-accent/10 text-accent-foreground rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">暂无数据</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">经验要求</h4>
                <p className="text-foreground">
                  {jdAnalysis.capabilityProfile.experienceLevel || '暂无数据'}
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">学历要求</h4>
                <p className="text-foreground">
                  {jdAnalysis.capabilityProfile.educationRequirements.length > 0
                    ? jdAnalysis.capabilityProfile.educationRequirements.join(', ')
                    : '暂无数据'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">JD关键词</h4>
              <div className="flex flex-wrap gap-2">
                {jdAnalysis.keywords.length > 0 ? (
                  jdAnalysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">暂无数据</span>
                )}
              </div>
            </div>

            {jdAnalysis.capabilityProfile.frequencyAnalysis && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">技能频率分析</h4>
                <div className="space-y-2">
                  {Object.entries(jdAnalysis.capabilityProfile.frequencyAnalysis.skillFrequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([skill, count]) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="text-sm text-foreground w-24 truncate">{skill}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(count / jdAnalysis.capabilityProfile.frequencyAnalysis.totalJDs) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}次
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">简历技能</h4>
              <div className="flex flex-wrap gap-2">
                {resumeAnalysis.skills.length > 0 ? (
                  resumeAnalysis.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        resumeAnalysis.matchedSkills.includes(skill)
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">暂无数据</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">工作经验</h4>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-foreground">
                  {resumeAnalysis.experience || '暂无数据'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">简历关键词</h4>
              <div className="flex flex-wrap gap-2">
                {resumeAnalysis.keywords.length > 0 ? (
                  resumeAnalysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">暂无数据</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-green-700 mb-2">已匹配技能数</h4>
                <p className="text-2xl font-bold text-green-600">
                  {resumeAnalysis.matchedSkills.length}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-red-700 mb-2">缺失技能数</h4>
                <p className="text-2xl font-bold text-red-600">
                  {resumeAnalysis.missingSkills.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          重新分析
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}