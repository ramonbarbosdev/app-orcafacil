import { z } from 'zod';

export const EmpresaMetodoPrecificacaosSchema = z.object({
 idMetodoPrecificacao: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? null : num;
    }
    if (typeof val === 'number') return val;
    return null;
  }, z.number('O Método é obrigatório').min(1, 'O Método é obrigatório')),
});

export const EmpresaMetodoPrecificacaoSchema = z.array(EmpresaMetodoPrecificacaosSchema);
