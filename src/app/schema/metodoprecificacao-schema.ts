import { z } from 'zod';

export const MetodoPrecificacaosSchema = z.object({
  cdMetodoPrecificacao: z.string('O Código é obrigatório').min(1, 'O Código é obrigatório'),
  nmMetodoPrecificacao: z.string('O Nome é obrigatório').min(1, 'O Nome é obrigatório'),

});

export const MetodoPrecificacaoSchema = z.array(MetodoPrecificacaosSchema);
