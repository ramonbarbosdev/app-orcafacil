import { z } from 'zod';

export const OrcamentoClientesSchema = z.object({
  
  nuCpfcnpj: z.string('O CPF/CNPJ é obrigatório').min(1, 'O CPF/CNPJ é obrigatório'),
  nmCliente: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),

});

export const OrcamentoClienteSchema = z.array(OrcamentoClientesSchema);
