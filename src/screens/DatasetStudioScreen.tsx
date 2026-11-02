import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Plus,
  Terminal,
  FileText,
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
          <span>Google AI Studio &amp; Gemini Cloud Assist</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mt-1">
          SK Balochi AI Datasets &amp; Cloud Architecture Reference
        </h1>
        <p className="text-sm text-[var(--text-sec)] mt-1">
          Copy the ready-to-use Dataset Name and Description blocks directly into Google AI Studio, add new prompt workflows, or copy GKE &amp; Pub/Sub CLI commands.
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
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(pr.promptText, `pr-${pr.id}`)
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline"
                    >
                      {copiedKey === `pr-${pr.id}` ? 'Copied!' : 'Copy Prompt'}
                    </button>
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
    </div>
  );
};
