import { z } from 'zod';

export const OrcamentosSchema = z.object({
  
  nuOrcamento: z.string('O Número do Orçamento é obrigatório').min(1, 'O Número do Orçamento é obrigatório'),
   dtEmissao: z.preprocess((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }, z.date('A Emissão é obrigatório')),
   dtValido: z.preprocess((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }, z.date("O 'Valido Até' é obrigatório")),


});

export const OrcamentoSchema = z.array(OrcamentosSchema);
