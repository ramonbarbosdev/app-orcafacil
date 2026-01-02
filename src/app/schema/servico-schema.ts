import { z } from 'zod';

export const ServicosSchema = z.object({
  cdServico: z.string('O código é obrigatório').min(1, 'O código  é obrigatório'),
  nmServico: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),
  idCategoriaservico: z.preprocess((val) => {
    if (typeof val === 'string') {
      const num = Number(val);
      return isNaN(num) ? null : num;
    }
    if (typeof val === 'number') return val;
    return null;
  }, z.number('A Categoria é obrigatório').min(1, 'A Categoria é obrigatório')),
});

export const ServicoSchema = z.array(ServicosSchema);
