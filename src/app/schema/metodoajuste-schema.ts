import { z } from 'zod';

export const MetodoAjustesSchema = z.object({
  tpOperacao: z.string('O tipo da operação é obrigatório').min(1, 'O tipo da operação é obrigatório'),
  tpAjuste: z.string('O tipo de ajuste é obrigatório').min(1, 'O tipo de ajuste é obrigatório'),
  // vlCondicao: z.string('O valor esperado é obrigatório').min(1, 'O valor esperado é obrigatório'),
  vlIncremento: z
    .number('O valor de ajuste é obrigatório')
    .min(1, 'O valor de ajuste é obrigatório'),
  // vlCondicao: z
  //   .number('O valor de esperado é obrigatório')
  //   .min(1, 'O valor de esperado é obrigatório'),
  idCampoPersonalizado: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? null : num;
    }
    if (typeof val === 'number') return val;
    return null;
  }, z.number('O campo personalizado é obrigatório').min(1, 'O campo personalizado é obrigatório')),
});

export const MetodoAjusteSchema = z.array(MetodoAjustesSchema);
