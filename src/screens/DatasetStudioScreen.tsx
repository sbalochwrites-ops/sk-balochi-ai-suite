import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Plus,
  Terminal,
  FileText,
  Sparkles,
  Play,
  Loader2,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  CloudAssistTopicEntity,
  DatasetOptionEntity,
} from '../database/entities';

interface DatasetStudioScreenProps {
  datasets: DatasetOptionEntity[];
  cloudTopics: CloudAssistTopicEntity[];
  onAddPromptWorkflow: (
    datasetId: string,
    prompt: {
      title: string;
      promptText: string;
      variables: string[];
      expectedOutput: string;
    }
  ) => void;
}

export const DatasetStudioScreen: React.FC<DatasetStudioScreenProps> = ({
  datasets,
  cloudTopics,
  onAddPromptWorkflow,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedDsId, setSelectedDsId] = useState<string>(
    datasets[0]?.id ?? 'ds-option-1'
  );
  const [promptTitle, setPromptTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [variablesInput, setVariablesInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');

  // Live Gemini Prompt Testing Modal State
  const [activeTestPrompt, setActiveTestPrompt] = useState<{
    title: string;
    promptText: string;
    variables: string[];
  } | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [selectedPreset, setSelectedPreset] = useState<
    'hydrogen-low' | 'hydrogen-medium' | 'hydrogen-high'
  >('hydrogen-low');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  const openPromptTester = (prompt: {
    title: string;
    promptText: string;
    variables: string[];
  }) => {
    setActiveTestPrompt(prompt);
    const initialVars: Record<string, string> = {};
    prompt.variables.forEach((v) => {
      const lower = v.toLowerCase();
      if (lower.includes('tone')) {
        initialVars[v] = 'Cultural Balochi elegance, authentic handcrafted luxury, warm and welcoming';
      } else if (lower.includes('region') || lower.includes('city')) {
        initialVars[v] = 'Quetta, Balochistan, Pakistan';
      } else if (lower.includes('product') || lower.includes('item')) {
        initialVars[v] = 'SK Handcrafted Silk Embroidered Balochi Pashmina Shawl';
      } else if (lower.includes('query') || lower.includes('question')) {
        initialVars[v] = 'What is the shipping duration to Lahore and can I pay via COD or online transfer?';
      } else if (lower.includes('discount')) {
        initialVars[v] = '20% Eid Special Discount';
      } else {
        initialVars[v] = 'Premium Quality Craft';
      }
    });
    setVariableValues(initialVars);
    setGenerationResult(null);
    setUsedModel(null);
    setGenerationError(null);
    setExecutionTimeMs(null);
  };

  const getInterpolatedPrompt = () => {
    if (!activeTestPrompt) return '';
    let text = activeTestPrompt.promptText;
    for (const [key, val] of Object.entries(variableValues)) {
      text = text.replaceAll(`{${key}}`, val).replaceAll(`{{${key}}}`, val);
    }
    return text;
  };

  const handleRunLiveGemini = async () => {
    const promptToRun = getInterpolatedPrompt();
    if (!promptToRun) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResult(null);
    setUsedModel(null);
    const startTime = Date.now();

    const thinkingLevel =
      selectedPreset === 'hydrogen-high'
        ? 'HIGH'
        : selectedPreset === 'hydrogen-medium'
          ? 'MEDIUM'
          : 'LOW';

    try {
      const res = await fetch('/api/gemini/run-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToRun,
          model: 'gemini-4-hydrogen',
          thinkingLevel,
        }),
      });

      const data = await res.json();
      setExecutionTimeMs(Date.now() - startTime);

      if (!res.ok || !data.success) {
        setGenerationError(data.error || 'Failed to generate response from Gemini API.');
      } else {
        setGenerationResult(data.text);
        setUsedModel(data.model || 'gemini-4-hydrogen');
      }
    } catch (err: unknown) {
      setGenerationError(
        (err as { message?: string })?.message ||
          'Network error: could not connect to local Express server at /api/gemini/run-prompt.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyResult = () => {
    if (!generationResult) return;
    navigator.clipboard.writeText(generationResult);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptTitle.trim() || !promptText.trim()) return;
    const vars = variablesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onAddPromptWorkflow(selectedDsId, {
      title: promptTitle.trim(),
      promptText: promptText.trim(),
      variables: vars.length > 0 ? vars : ['brand_tone', 'region'],
      expectedOutput:
        expectedOutput.trim() || 'Structured bilingual output ready for review',
    });
    setPromptTitle('');
    setPromptText('');
    setVariablesInput('');
    setExpectedOutput('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
          <span>DatasetDao</span>
          <span aria-hidden="true">·</span>
          <span>Google AI Studio &amp; Gemini 4 Hydrogen API</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mt-1">
          SK AI Studio — AI Datasets &amp; Gemini Prompt Workflows
        </h1>
        <p className="text-sm text-[var(--text-sec)] mt-1">
          Copy dataset definitions directly into Google AI Studio, test prompt workflows live with Gemini 4 Hydrogen, or inspect GKE &amp; Pub/Sub Cloud Assist architectures.
        </p>
      </div>

      {/* 2 Copy-Ready Dataset Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-5"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <div className="text-xs font-semibold text-[var(--text-sec)]">
                  {ds.optionLabel}
                </div>
                <h2 className="text-lg font-bold text-[var(--text)] font-mono-num mt-1">
                  {ds.name}
                </h2>
                <p className="text-sm font-semibold text-[var(--primary)] urdu mt-0.5">
                  {ds.optionTitleUrdu}
                </p>
              </div>
              <Database className="w-5 h-5 text-[var(--primary)] shrink-0" />
            </div>

            {/* Copyable Name Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-sec)]">
                  Name (Copy for Google AI Studio)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(ds.name, `name-${ds.id}`)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                >
                  {copiedKey === `name-${ds.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Name</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] font-mono-num text-xs font-semibold text-[var(--text)]">
                {ds.name}
              </div>
            </div>

            {/* Copyable Description Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-sec)]">
                  Description (Copy for Google AI Studio)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(ds.description, `desc-${ds.id}`)
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                >
                  {copiedKey === `desc-${ds.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Description</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] leading-relaxed">
                {ds.description}
              </div>
            </div>

            {/* Stored Prompts in this Dataset */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold text-[var(--text-sec)]">
                Active Prompt Workflows ({ds.samplePrompts.length})
              </div>
              {ds.samplePrompts.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text)]">
                      {pr.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPromptTester(pr)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1B5E20] hover:bg-[#114216] text-white text-[11px] font-semibold transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Test Live</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(pr.promptText, `pr-${pr.id}`)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline"
                      >
                        {copiedKey === `pr-${pr.id}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                    {pr.promptText}
                  </p>
                  <div className="text-[11px] font-mono-num text-[var(--text-ter)]">
                    Variables: {pr.variables.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Prompt Workflow to DatasetDao */}
      <section className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--primary)]" />
              <span>Add Prompt Workflow to Dataset (نیا پرامپٹ شامل کریں)</span>
            </h2>
            <p className="text-xs text-[var(--text-sec)] mt-0.5">
              Save new brand localization or Shopify customer bot prompts directly to DatasetDao.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddPrompt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Target Dataset
              </label>
              <select
                value={selectedDsId}
                onChange={(e) => setSelectedDsId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Workflow Title
              </label>
              <input
                type="text"
                required
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                placeholder="e.g. Balochi Shawl Winter Ad Copy"
                className="w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Template Variables (comma separated)
              </label>
              <input
                type="text"
                value={variablesInput}
                onChange={(e) => setVariablesInput(e.target.value)}
                placeholder="product_name, discount_pct, city"
                className="w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-mono-num text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Prompt Instruction Text
              </label>
              <textarea
                rows={2}
                required
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Write the exact prompt instruction for Gemini..."
                className="w-full p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Expected Output Format
              </label>
              <textarea
                rows={2}
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="e.g. JSON object with Urdu headline and Shopify meta tags"
                className="w-full p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Save Prompt to Dataset</span>
            </button>
          </div>
        </form>
      </section>

      {/* Gemini Cloud Assist Actionable Knowledge Base (GKE Scaling, Pub/Sub, Cloud Assist) */}
      <section className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-6">
        <div className="pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
            <Terminal className="w-4 h-4 text-[var(--primary)]" />
            <span>Gemini Cloud Assist · GKE &amp; Cross-Project Pub/Sub</span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text)] mt-1">
            Cloud Architecture &amp; Scaling Playbook
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cloudTopics.map((topic) => (
            <div
              key={topic.id}
              className="p-5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {topic.question}
                </h3>
                <p className="text-xs font-semibold text-[var(--primary)] urdu">
                  {topic.questionUrdu}
                </p>
                <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                  {topic.summary}
                </p>

                <div className="space-y-3 pt-2">
                  {topic.bullets.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1.5"
                    >
                      <div className="text-xs font-bold text-[var(--text)]">
                        {b.title}
                      </div>
                      <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                        {b.detail}
                      </p>
                      {b.cliCommand && (
                        <div className="pt-1.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono-num text-[var(--text-ter)]">
                              CLI Command
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  b.cliCommand!,
                                  `cli-${topic.id}-${idx}`
                                )
                              }
                              className="text-[10px] font-semibold text-[var(--primary)] hover:underline"
                            >
                              {copiedKey === `cli-${topic.id}-${idx}`
                                ? 'Copied!'
                                : 'Copy CLI'}
                            </button>
                          </div>
                          <pre className="p-2 rounded bg-[var(--bg)] text-[11px] font-mono-num text-[var(--text)] overflow-x-auto">
                            {b.cliCommand}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Gemini AI Testing Modal */}
      {activeTestPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[var(--text)]">
                      Live Gemini AI Prompt Runner
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      gemini-4-hydrogen
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-sec)] mt-0.5">
                    {activeTestPrompt.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTestPrompt(null)}
                className="p-1.5 rounded-lg text-[var(--text-sec)] hover:bg-[var(--surface-2)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Variables Form */}
            {activeTestPrompt.variables.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[var(--text-sec)] flex items-center justify-between">
                  <span>Prompt Variables ({activeTestPrompt.variables.length})</span>
                  <span className="text-[11px] text-[var(--text-ter)]">
                    Values are inserted into prompt placeholders
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTestPrompt.variables.map((v) => (
                    <div key={v} className="space-y-1">
                      <label className="block text-[11px] font-mono-num font-medium text-[var(--text)]">
                        {'{' + v + '}'}
                      </label>
                      <input
                        type="text"
                        value={variableValues[v] || ''}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [v]: e.target.value,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:border-[var(--primary)] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interpolated Prompt Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-sec)]">
                <span>Final Prompt Sent to Gemini:</span>
                <span className="text-[10px] font-mono-num text-[var(--text-ter)]">
                  {getInterpolatedPrompt().length} chars
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] font-mono-num leading-relaxed max-h-36 overflow-y-auto">
                {getInterpolatedPrompt()}
              </div>
            </div>

            {/* Controls Bar: Model selector & Run button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[var(--text-sec)]">
                  Model:
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) =>
                    setSelectedPreset(
                      e.target.value as
                        | 'hydrogen-low'
                        | 'hydrogen-medium'
                        | 'hydrogen-high'
                    )
                  }
                  className="h-9 px-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="hydrogen-low">
                    gemini-4-hydrogen · Fast (Recommended)
                  </option>
                  <option value="hydrogen-medium">
                    gemini-4-hydrogen · Balanced Reasoning
                  </option>
                  <option value="hydrogen-high">
                    gemini-4-hydrogen · Deep Reasoning
                  </option>
                </select>
              </div>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleRunLiveGemini}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] disabled:opacity-60 text-white text-xs font-semibold transition-colors min-h-[38px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Response</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {generationError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Generation Failed</div>
                  <div>{generationError}</div>
                </div>
              </div>
            )}

            {/* AI Result Card */}
            {generationResult && (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Gemini AI Generated Output</span>
                    {usedModel && (
                      <span className="text-[11px] font-mono-num font-normal text-[var(--text-sec)]">
                        ({usedModel})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {executionTimeMs && (
                      <span className="flex items-center gap-1 text-[11px] font-mono-num text-[var(--text-sec)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{executionTimeMs} ms</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary)]/90"
                    >
                      {copiedResult ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Result!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Output</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-[var(--text)] whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto p-2 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
                  {generationResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
