import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { api } from '../../lib/api';
import type { Task } from '../../types';
import { useAuth } from '../../providers/AuthProvider';
import { OnboardingChecklist } from '../../components/dashboard/OnboardingChecklist';
import { UsageTips } from '../../components/help/UsageTips';

type DashboardResponse = {
  stats: {
    contactCount: number;
    openTasks: number;
    wins: number;
    automationCount: number;
    campaignCount: number;
    templateCount: number;
  };
};

const fetchStats = async () => {
  const { data } = await api.get<DashboardResponse>('/dashboard');
  return data.stats;
};

const fetchTasks = async () => {
  const { data } = await api.get<{ tasks: Task[] }>('/tasks', { params: { status: 'pending' } });
  return data.tasks;
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const { data: tasks } = useQuery({ queryKey: ['tasks', 'pending'], queryFn: fetchTasks });

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Contacts" value={stats?.contactCount ?? '—'} />
        <StatCard label="Open tasks" value={stats?.openTasks ?? '—'} />
        <StatCard label="Wins" value={stats?.wins ?? '—'} />
        <StatCard label="Automations" value={stats?.automationCount ?? '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {stats && (
          <OnboardingChecklist
            stats={{
              contactCount: stats.contactCount,
              automationCount: stats.automationCount,
              campaignCount: stats.campaignCount,
              templateCount: stats.templateCount,
            }}
            emailVerified={Boolean(user?.emailVerified)}
          />
        )}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming tasks</h2>
          <div className="mt-4 space-y-3">
            {tasks?.length ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    {task.contact && (
                      <p className="text-sm text-slate-500">Contact: {task.contact.name ?? 'N/A'}</p>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {task.dueDate ? dayjs(task.dueDate).format('DD MMM, HH:mm') : 'No due date'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No upcoming tasks.</p>
            )}
          </div>
        </div>
      </div>

      <UsageTips context="app" />
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
    <p className="text-sm uppercase tracking-widest text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

