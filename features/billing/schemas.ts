import { z } from 'zod';

// Service Definition Schemas
export const serviceDefinitionSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'El nombre es requerido'),
    icon: z.string(),
    color: z.string(),
    category: z.string().optional(),
    isSystemService: z.boolean().optional(),
});

export type ServiceDefinitionInput = z.infer<typeof serviceDefinitionSchema>;

// Service Instance Schemas
export const serviceInstanceSchema = z.object({
    id: z.string(),
    serviceDefinitionId: z.string(),
    name: z.string().min(1, 'El nombre es requerido'),
    amount: z.number().positive('El monto debe ser positivo'),
    currency: z.enum(['MXN', 'USD', 'EUR']).default('MXN'),
    billingDay: z.number().min(1).max(31),
    isActive: z.boolean().default(true),
    nextPaymentDate: z.string().optional(),
    notes: z.string().optional(),
});

export type ServiceInstanceInput = z.infer<typeof serviceInstanceSchema>;

export const createServiceInstanceSchema = serviceInstanceSchema.omit({ id: true });
export type CreateServiceInstanceInput = z.infer<typeof createServiceInstanceSchema>;
