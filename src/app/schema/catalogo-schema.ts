import { z } from 'zod';

export const CatalogosSchema = z.object({

  cdCatalogo: z.string('O código é obrigatório').min(1, 'O código é obrigatório'),
  nmCatalogo: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),
  tpItem: z
    .string('O Tipo é obrigatório')
    .min(1, 'O Tipo é obrigatório'),

});

export const CatalogoSchema = z.array(CatalogosSchema);
