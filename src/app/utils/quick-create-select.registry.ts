import { QuickCreateConfig, QuickCreatePreset } from '../models/quick-create-select';
import { TipoCampo, TipoCampoLabel } from '../enum/TipoCampo';
import { TipoValor, TipoValorLabel } from '../enum/TipoValor';

function formatarCodigoCampo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();
}

const REGISTRY: Record<QuickCreatePreset, QuickCreateConfig> = {
  'categorias-servico': {
    endpoint: 'categorias-servico',
    title: 'Nova categoria de serviço',
    useSequence: true,
    sequenceField: 'cdCategoriaservico',
    idField: 'idCategoriaServico',
    labelField: 'nmCategoriaServico',
    valueField: 'idCategoriaServico',
    fields: [
      { key: 'nmCategoriaservico', label: 'Nome', type: 'text', required: true, placeholder: 'Ex.: Instalação' },
      { key: 'dsObservacoes', label: 'Observações', type: 'textarea', placeholder: 'Opcional' },
    ],
    preparePayload: (form) => ({
      nmCategoriaservico: form['nmCategoriaservico'],
      dsObservacoes: form['dsObservacoes'] ?? '',
      cdCategoriaservico: form['cdCategoriaservico'],
    }),
  },
  'condicoes-pagamento': {
    endpoint: 'condicoes-pagamento',
    title: 'Nova condição de pagamento',
    useSequence: true,
    sequenceField: 'cdCondicaoPagamento',
    idField: 'idCondicaoPagamento',
    labelField: 'nmCondicaoPagamento',
    valueField: 'idCondicaoPagamento',
    fields: [
      {
        key: 'nmCondicaoPagamento',
        label: 'Nome',
        type: 'text',
        required: true,
        placeholder: 'Ex.: À vista',
      },
    ],
    preparePayload: (form) => ({
      nmCondicaoPagamento: form['nmCondicaoPagamento'],
      cdCondicaoPagamento: form['cdCondicaoPagamento'],
    }),
  },
  'campos-personalizados': {
    endpoint: 'campos-personalizados',
    title: 'Novo material / campo',
    idField: 'idCampoPersonalizado',
    labelField: 'nmCampoPersonalizado',
    valueField: 'idCampoPersonalizado',
    fields: [
      {
        key: 'nmCampoPersonalizado',
        label: 'Nome',
        type: 'text',
        required: true,
        placeholder: 'Ex.: Espessura do vidro',
      },
      {
        key: 'tpCampoValor',
        label: 'Tipo do valor',
        type: 'select',
        required: true,
        optionsEndpoint: 'campos-personalizados/tipo-valor',
        optionsLabelMap: TipoValorLabel as Record<string, string>,
        defaultValue: TipoValor.PRECO_FIXO,
      },
      {
        key: 'tpCampoPersonalizado',
        label: 'Tipo do campo',
        type: 'select',
        required: true,
        optionsEndpoint: 'campos-personalizados/tipo-campo',
        optionsLabelMap: TipoCampoLabel as Record<string, string>,
        defaultValue: TipoCampo.TEXT,
      },
    ],
    preparePayload: (form) => {
      const nome = String(form['nmCampoPersonalizado'] ?? '').trim();
      return {
        nmCampoPersonalizado: nome,
        tpCampoValor: form['tpCampoValor'],
        tpCampoPersonalizado: form['tpCampoPersonalizado'],
        cdCampoPersonalizado: formatarCodigoCampo(nome),
      };
    },
  },
  'empresa-metodos-precificacao': {
    endpoint: 'empresa-metodos-precificacao',
    title: 'Novo método de precificação',
    dynamicMode: 'empresa-metodo-precificacao',
    idField: 'idEmpresaMetodoPrecificacao',
    labelField: 'nmMetodoPrecificacao',
    valueField: 'idEmpresaMetodoPrecificacao',
    fields: [],
    preparePayload: (form) => ({
      idMetodoPrecificacao: form['idMetodoPrecificacao'],
      configuracao: form['configuracao'] ?? {},
    }),
  },
  catalogos: {
    endpoint: 'catalogos',
    title: 'Novo catálogo',
    useSequence: true,
    sequenceField: 'cdCatalogo',
    idField: 'idCatalogo',
    labelField: 'nmCatalogo',
    valueField: 'idCatalogo',
    fields: [
      { key: 'nmCatalogo', label: 'Nome', type: 'text', required: true, placeholder: 'Ex.: Vidro temperado' },
      {
        key: 'tpItem',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [
          { code: 'Produto', name: 'Produto' },
          { code: 'Servico', name: 'Serviço' },
        ],
        defaultValue: 'Produto',
      },
    ],
    preparePayload: (form) => ({
      nmCatalogo: form['nmCatalogo'],
      tpItem: form['tpItem'] ?? 'Produto',
      cdCatalogo: form['cdCatalogo'],
      dsCatalogo: '',
      vlCustoBase: 0,
      vlPrecoBase: 0,
      campos: [],
    }),
  },
};

export function resolveQuickCreateConfig(
  preset?: QuickCreatePreset | null,
  custom?: QuickCreateConfig | null
): QuickCreateConfig | null {
  if (custom) {
    return custom;
  }
  if (preset) {
    return REGISTRY[preset] ?? null;
  }
  return null;
}
