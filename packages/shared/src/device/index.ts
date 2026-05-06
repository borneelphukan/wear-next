import { z } from 'zod';

export const devicePairSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Invalid MAC address format'),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  firmwareVersion: z.string().min(1, 'Firmware version is required')
});

export type DevicePairInput = z.infer<typeof devicePairSchema>;
