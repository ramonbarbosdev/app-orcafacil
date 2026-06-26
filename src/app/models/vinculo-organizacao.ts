export class VinculoOrganizacao {
  public idUsuario?: number;
  public nuCpf: string = '';
  public nmUsuario: string = '';
  public dsSenha: string = '';
  public dsRole: 'ADMIN' | 'USER' = 'USER';
}

export interface VinculoOrganizacaoListItem {
  idUsuario: number;
  nuCpf: string;
  nmUsuario: string;
  dsRole: 'ADMIN' | 'USER';
}
