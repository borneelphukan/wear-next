import { z } from 'zod';

export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phone: z.string().optional(),
  height: z.number().min(0, 'Height must be positive').optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  birthDate: z.string().datetime().optional()
});

export const updateGoalsSchema = z.object({
  dailyStepsGoal: z.number().int().min(100, 'Steps goal must be at least 100'),
  dailyCaloriesGoal: z.number().int().min(100, 'Calories goal must be at least 100'),
  sleepGoalMinutes: z.number().int().min(60, 'Sleep goal must be at least 60 minutes')
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsSchema>;
