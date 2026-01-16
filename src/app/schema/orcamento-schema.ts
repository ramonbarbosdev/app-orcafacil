import { z } from 'zod';

export const OrcamentosSchema = z.object({

  nuOrcamento: z.string('O Número do Orçamento é obrigatório').min(1, 'O Número do Orçamento é obrigatório'),
    nuPrazoEntrega: z.number('O Prazo de entrega é obrigatório').min(1, 'O Prazo de entrega é obrigatório'),
  dtEmissao: z.preprocess((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }, z.date('A Emissão é obrigatório')),
  dtValido: z.preprocess((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }, z.date("O 'Valido Até' é obrigatório")),

  idCondicaoPagamento: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? null : num;
    }
    if (typeof val === 'number') return val;
    return null;
  }, z.number('A Condição de pagamento é obrigatório').min(1, 'A Condição de pagamento é obrigatório')),
  idEmpresaMetodoPrecificacao: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? null : num;
    }
    if (typeof val === 'number') return val;
    return null;
  }, z.number('O Método de Precificação é obrigatório').min(1, 'O Método de Precificação é obrigatório')),

  dsObservacoes: z
    .string()
    .max(255, 'Observação pode ter no máximo 255 caracteres')
    .optional(),


});

export const OrcamentoSchema = z.array(OrcamentosSchema);
