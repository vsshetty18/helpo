import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TelemetryReading } from '../../types/telemetry';

interface SensorLineChartProps {
  data: TelemetryReading[];
  type?: 'acceleration' | 'speed' | 'impact';
  height?: number;
}

export const SensorLineChart: React.FC<SensorLineChartProps> = ({
  data,
  type = 'acceleration',
  height = 260
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg p-6" style={{ height }}>
        <span className="font-semibold text-slate-600">0 Telemetry Packets</span>
        <span className="text-[11px] text-slate-400 mt-0.5">Awaiting live telemetry sensor stream.</span>
      </div>
    );
  }

  const chartData = data.map((reading, index) => {
    const timeLabel = new Date(reading.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit'
    });

    return {
      index,
      time: timeLabel,
      speed: reading.speed,
      accelX: reading.acceleration.x,
      accelY: reading.acceleration.y,
      accelZ: reading.acceleration.z,
      impact: reading.impactPressure,
      gyroZ: reading.gyro.z
    };
  });

  if (type === 'speed') {
    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
            <YAxis unit=" km/h" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#3478F6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#3478F6' }}
              name="Speed (km/h)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'impact') {
    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
            <YAxis unit=" kPa" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="impact"
              stroke="#EF4444"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444' }}
              name="Piezo Impact (kPa)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Acceleration multi-axis (X, Y, Z)
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
          <YAxis unit=" G" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
          <Line type="monotone" dataKey="accelX" stroke="#3478F6" strokeWidth={2} dot={false} name="Accel X (Surge)" />
          <Line type="monotone" dataKey="accelY" stroke="#10B981" strokeWidth={2} dot={false} name="Accel Y (Sway)" />
          <Line type="monotone" dataKey="accelZ" stroke="#F59E0B" strokeWidth={2} dot={false} name="Accel Z (Heave)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
