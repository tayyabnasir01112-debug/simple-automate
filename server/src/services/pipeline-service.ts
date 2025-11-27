import { prisma } from '../lib/prisma';

const DEFAULT_STAGES = ['New', 'Contacted', 'Qualified', 'Won'];

export const ensureDefaultPipeline = async (userId: string) => {
  const existing = await prisma.pipeline.findFirst({ where: { userId } });
  if (existing) return existing;

  return prisma.pipeline.create({
    data: {
      userId,
      name: 'Sales Pipeline',
      stages: {
        create: DEFAULT_STAGES.map((name, index) => ({ name, position: index })),
      },
    },
  });
};

