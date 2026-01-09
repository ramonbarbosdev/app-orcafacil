export function FormatarDataAPI(data: any): any {
  if (!data) return null;
  return data.toISOString().split('T')[0];
}

export const FormatarDataParaInput = (
  data: Date | string | number[] | null | undefined
): string => {
  if (!data) return '';

  let dateObj: Date;

  if (Array.isArray(data) && data.length >= 3) {
    dateObj = new Date(data[0], data[1] - 1, data[2]);
  } else if (typeof data === 'string' || data instanceof Date) {
    dateObj = new Date(data);
  } else {
    console.error('Formato de data não suportado:', data);
    return '';
  }

  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida após tentativa de conversão:', data);
    return '';
  }

  const ano = dateObj.getFullYear();
  const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const dia = dateObj.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export function FormatarDataBanco(dateString: any): any {
  if (!dateString) return null;
  return new Date(dateString);
}

export function CalcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mes = hoje.getMonth() - dataNascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }

  return idade;
}

export function FormatDataParaListagem(value: string | Date | null): string {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return value.toString();

  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();

  return `${dia}/${mes}/${ano}`;
}
