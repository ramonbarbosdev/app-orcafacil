import { z } from 'zod';

export const ModuloPermissaoCreateSchema = z.object({
  codigoModulo: z
    .string()
    .min(2, 'Informe o código do módulo')
    .max(80)
    .regex(/^[a-z][a-z0-9-]*$/, 'Use letras minúsculas, números e hífen (ex: tipo-item)'),
  nmModulo: z.string().min(2, 'Informe o nome do recurso').max(120),
});

export const ModuloPermissaoUpdateSchema = z.object({
  nmModulo: z.string().min(2, 'Informe o nome do recurso').max(120),
  flAtivo: z.boolean(),
});
