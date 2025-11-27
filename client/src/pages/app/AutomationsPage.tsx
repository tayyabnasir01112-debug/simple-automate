import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Automation, Pipeline } from '../../types';

const fetchAutomations = async () => {
  const { data } = await api.get<{ automations: Automation[] }>('/automations');
  return data.automations;
};

const fetchPipelines = async () => {
  const { data } = await api.get<{ pipelines: Pipeline[] }>('/pipelines');
  return data.pipelines;
};

type DraftStep = {
  id: string;
  type: Automation['steps'][number]['type'];
  config: Record<string, unknown>;
};

export const AutomationsPage = () => {
  const queryClient = useQueryClient();
  const { data: automations } = useQuery({ queryKey: ['automations'], queryFn: fetchAutomations });
  const { data: pipelines } = useQuery({ queryKey: ['pipelines'], queryFn: fetchPipelines });
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<Automation['triggerType']>('NEW_CONTACT');
  const [steps, setSteps] = useState<DraftStep[]>([]);

  const createAutomation = useMutation({
    mutationFn: () =>
      api.post('/automations', {
        name,
        triggerType,
        steps: steps.map((step, index) => ({
          type: step.type,
          position: index,
          config: step.config,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      setName('');
      setSteps([]);
    },
  });

  const addStep = (type: DraftStep['type']) => {
    const configDefaults: Record<string, unknown> = {};
    if (type === 'SEND_EMAIL') configDefaults.subject = 'New automation email';
    if (type === 'DELAY') configDefaults.amount = 2;
    if (type === 'DELAY') configDefaults.unit = 'day';
    if (type === 'UPDATE_TAGS') configDefaults.tags = ['nurture'];
    if (type === 'MOVE_STAGE') configDefaults.stageId = pipelines?.[0]?.stages[0]?.id;

    setSteps((prev) => [...prev, { id: crypto.randomUUID(), type, config: configDefaults }]);
  };

  const removeStep = (id: string) => setSteps((prev) => prev.filter((step) => step.id !== id));

  const stageOptions = useMemo(
    () => pipelines?.flatMap((pipeline) => pipeline.stages) ?? [],
    [pipelines],
  );

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">Automation builder</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Automation name"
            className="rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
          />
          <select
            value={triggerType}
            onChange={(event) => setTriggerType(event.target.value as Automation['triggerType'])}
            className="rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
          >
            <option value="NEW_CONTACT">New contact</option>
            <option value="STAGE_CHANGE">Pipeline stage change</option>
            <option value="DATE">Date-based</option>
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  Step {index + 1}: {step.type.replace('_', ' ').toLowerCase()}
                </p>
                <button className="text-xs text-red-500" onClick={() => removeStep(step.id)}>
                  Remove
                </button>
              </div>
              {step.type === 'SEND_EMAIL' && (
                <input
                  value={step.config.subject as string}
                  onChange={(event) =>
                    setSteps((prev) =>
                      prev.map((current) =>
                        current.id === step.id
                          ? { ...current, config: { ...current.config, subject: event.target.value } }
                          : current,
                      ),
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              )}
              {step.type === 'DELAY' && (
                <div className="mt-3 flex gap-3">
                  <input
                    type="number"
                    min={1}
                    value={step.config.amount as number}
                    onChange={(event) =>
                      setSteps((prev) =>
                        prev.map((current) =>
                          current.id === step.id
                            ? {
                                ...current,
                                config: { ...current.config, amount: Number(event.target.value) },
                              }
                            : current,
                        ),
                      )
                    }
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2"
                  />
                  <select
                    value={step.config.unit as string}
                    onChange={(event) =>
                      setSteps((prev) =>
                        prev.map((current) =>
                          current.id === step.id
                            ? { ...current, config: { ...current.config, unit: event.target.value } }
                            : current,
                        ),
                      )
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="minute">Minutes</option>
                    <option value="hour">Hours</option>
                    <option value="day">Days</option>
                  </select>
                </div>
              )}
              {step.type === 'UPDATE_TAGS' && (
                <input
                  value={(step.config.tags as string[]).join(', ')}
                  onChange={(event) =>
                    setSteps((prev) =>
                      prev.map((current) =>
                        current.id === step.id
                          ? {
                              ...current,
                              config: { ...current.config, tags: event.target.value.split(',').map((tag) => tag.trim()) },
                            }
                          : current,
                      ),
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              )}
              {step.type === 'MOVE_STAGE' && (
                <select
                  value={step.config.stageId as string}
                  onChange={(event) =>
                    setSteps((prev) =>
                      prev.map((current) =>
                        current.id === step.id
                          ? { ...current, config: { ...current.config, stageId: event.target.value } }
                          : current,
                      ),
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  {stageOptions.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => addStep('SEND_EMAIL')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            + Email
          </button>
          <button
            onClick={() => addStep('DELAY')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            + Delay
          </button>
          <button
            onClick={() => addStep('UPDATE_TAGS')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            + Tags
          </button>
          <button
            onClick={() => addStep('MOVE_STAGE')}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            + Move stage
          </button>
          <button
            onClick={() => createAutomation.mutate()}
            disabled={!name || !steps.length}
            className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save automation
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {automations?.map((automation) => (
          <div key={automation.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{automation.name}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  automation.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {automation.active ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">Trigger: {automation.triggerType}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {automation.steps.map((step, index) => (
                <li key={step.id} className="rounded-xl border border-slate-100 px-3 py-2">
                  Step {index + 1}: {step.type.replace('_', ' ').toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

