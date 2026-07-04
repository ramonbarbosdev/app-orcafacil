import { ehStatusDeTentativa } from './notificacao.labels';

export interface WhatsappQrStatus {
  status?: string;
  conectado?: boolean;
  qr?: string;
  qrImagem?: string;
}

export function obterQrBruto(status?: WhatsappQrStatus | null): string {
  const qr = status?.qrImagem?.trim() || status?.qr?.trim();
  return qr ?? '';
}

export function montarQrImagemSrc(status?: WhatsappQrStatus | null): string {
  const qr = obterQrBruto(status);
  if (!qr) return '';
  return qr.startsWith('data:image/') ? qr : `data:image/png;base64,${qr}`;
}

export function aguardandoQrCode(status?: WhatsappQrStatus | null): boolean {
  if (!status || status.conectado) return false;
  return ehStatusDeTentativa(status.status) && !obterQrBruto(status);
}
