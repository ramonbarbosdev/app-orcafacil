import { z } from 'zod';

export const CatalogosSchema = z.object({

  cdCatalogo: z.string('O código é obrigatório').min(1, 'O código é obrigatório'),
  nmCatalogo: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),


});

export const CatalogoSchema = z.array(CatalogosSchema);
