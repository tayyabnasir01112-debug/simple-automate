import dayjs from 'dayjs';

type DurationUnit = 'second' | 'minute' | 'hour' | 'day';

const UNIT_MAP: Record<string, DurationUnit> = {
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
};

export const addDuration = (expression: string, date = dayjs()) => {
  const match = expression.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration expression "${expression}"`);
  }

  const [, valueStr, unitKey] = match;
  const value = Number(valueStr);
  const unit = UNIT_MAP[unitKey];
  return date.add(value, unit);
};

