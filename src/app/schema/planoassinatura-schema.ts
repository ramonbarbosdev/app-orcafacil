import { z } from 'zod';

export const PlanoAssinaturasSchema = z.object({
  nmPlanoAssinatura: z.string('O Nome é obrigatório').min(1, 'O Nome é obrigatório'),

});

export const PlanoAssinaturaSchema = z.array(PlanoAssinaturasSchema);
