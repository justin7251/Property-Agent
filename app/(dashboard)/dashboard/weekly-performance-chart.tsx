'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = {
  day: string;
  leads: number;
  goals: number;
};

export default function WeeklyPerformanceChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="goals" stroke="#84e1bc" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
