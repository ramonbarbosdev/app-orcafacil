import { z } from 'zod';

export const CategoriasServicosSchema = z.object({
  cdCategoriaservico: z.string('O código é obrigatório').min(1, 'O código  é obrigatório'),
  nmCategoriaservico: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),
});

export const CategoriasServicoSchema = z.array(CategoriasServicosSchema);
