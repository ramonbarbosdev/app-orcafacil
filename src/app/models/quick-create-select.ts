import { FlagOption } from './flag-option';

export type QuickCreateFieldType = 'text' | 'textarea' | 'number' | 'select';

export interface QuickCreateFieldConfig {
  key: string;
  label: string;
  type?: QuickCreateFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FlagOption[];
  optionsEndpoint?: string;
  optionsLabelMap?: Record<string, string>;
  defaultValue?: string | number;
}

export type QuickCreateDynamicMode = 'empresa-metodo-precificacao';

export interface QuickCreateConfig {
  endpoint: string;
  title: string;
  fields: QuickCreateFieldConfig[];
  useSequence?: boolean;
  sequenceField?: string;
  idField: string;
  labelField: string;
  valueField: string;
  dynamicMode?: QuickCreateDynamicMode;
  preparePayload?: (form: Record<string, unknown>) => Record<string, unknown>;
}

export type QuickCreatePreset =
  | 'categorias-servico'
  | 'condicoes-pagamento'
  | 'campos-personalizados'
  | 'catalogos'
  | 'empresa-metodos-precificacao';
