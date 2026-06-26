import { z } from 'zod';

export const LoginsSchema = z.object({
  nuCpf: z.string('O CPF é obrigatório').min(11, 'CPF deve ter 11 dígitos'),
  dsSenha: z.string('A Senha é obrigatória').min(1, 'A Senha é obrigatória'),
  idOrganizacao: z.union([z.string(), z.number()]).optional(),
});

export const LoginSchema = z.array(LoginsSchema);
