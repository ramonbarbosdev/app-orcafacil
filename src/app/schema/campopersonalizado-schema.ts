import { z } from 'zod';

export const CampoPersonalizadosSchema = z.object({
  cdCampoPersonalizado: z.string('O código é obrigatório').min(1, 'O código é obrigatório'),
  nmCampoPersonalizado: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),
  tpCampoPersonalizado: z.string('O tipo é obrigatório').min(1, 'O tipo é obrigatório'),

});

export const CampoPersonalizadoSchema = z.array(CampoPersonalizadosSchema);
