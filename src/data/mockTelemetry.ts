import { TelemetryReading } from '../types/telemetry';

export function generateInitialTelemetryHistory(vehicleId: string, baseSpeed: number = 45): TelemetryReading[] {
  const points: TelemetryReading[] = [];
  const now = Date.now();
  
  // Generate 20 historical readings (one reading every 3 seconds for the past 60s)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now - i * 3000).toISOString();
    const noise = (Math.sin(i * 0.7) * 2.5);
    const speed = Math.max(0, baseSpeed + noise + (Math.random() * 2 - 1));
    const accelX = parseFloat((0.08 + Math.sin(i * 0.5) * 0.15).toFixed(2));
    const accelY = parseFloat((0.02 + Math.cos(i * 0.3) * 0.10).toFixed(2));
    const accelZ = parseFloat((0.98 + (Math.random() * 0.06 - 0.03)).toFixed(2)); // ~1G earth gravity
    const impactPressure = parseFloat((12.5 + Math.random() * 3).toFixed(1));

    points.push({
      id: `tel-${vehicleId}-${i}`,
      vehicleId,
      timestamp,
      speed: parseFloat(speed.toFixed(1)),
      acceleration: { x: accelX, y: accelY, z: accelZ },
      gyro: {
        x: parseFloat((Math.sin(i) * 1.2).toFixed(2)),
        y: parseFloat((Math.cos(i) * 1.5).toFixed(2)),
        z: parseFloat((Math.sin(i * 0.5) * 0.8).toFixed(2))
      },
      impactPressure,
      gps: {
        lat: 12.9716 + (20 - i) * 0.0001,
        lng: 77.5946 + (20 - i) * 0.00015,
        altitude: 920,
        accuracy: 2.4
      },
      temperature: 34.2,
      status: 'normal',
      rollAngle: parseFloat((Math.sin(i * 0.4) * 2.1).toFixed(1)),
      pitchAngle: parseFloat((Math.cos(i * 0.3) * 1.8).toFixed(1))
    });
  }

  return points;
}
