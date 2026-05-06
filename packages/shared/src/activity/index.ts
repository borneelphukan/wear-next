import { z } from 'zod';

export const logActivitySchema = z.object({
  steps: z.number().int().min(0, 'Steps cannot be negative'),
  caloriesBurned: z.number().min(0, 'Calories burned cannot be negative'),
  distanceMeters: z.number().min(0, 'Distance cannot be negative'),
  activeMinutes: z.number().int().min(0, 'Active minutes cannot be negative'),
  date: z.string().datetime()
});

export type LogActivityInput = z.infer<typeof logActivitySchema>;

