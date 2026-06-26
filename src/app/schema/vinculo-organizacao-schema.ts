import { z } from 'zod';

export const VinculoOrganizacaoSchema = z.object({
  nuCpf: z
    .string('O CPF é obrigatório')
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().length(11, 'CPF deve ter 11 dígitos')),
  nmUsuario: z.string('O nome é obrigatório').min(1, 'O nome é obrigatório'),
  dsSenha: z.string('A senha é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
  dsRole: z.enum(['ADMIN', 'USER'], 'Selecione o perfil'),
});

export const VinculoOrganizacaoArraySchema = z.array(VinculoOrganizacaoSchema);
