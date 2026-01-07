import { z } from 'zod';

export const CondicaoPagamentosSchema = z.object({
  cdCondicaoPagamento: z.string('O Código é obrigatório').min(1, 'O Código é obrigatório'),
  nmCondicaoPagamento: z.string('O Nome é obrigatório').min(1, 'O Nome é obrigatório'),

});

export const CondicaoPagamentoSchema = z.array(CondicaoPagamentosSchema);
