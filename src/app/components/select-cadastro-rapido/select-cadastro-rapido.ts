import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { switchMap } from 'rxjs/operators';
import { BaseService } from '../../services/base.service';
import { FlagOption } from '../../models/flag-option';
import {
  QuickCreateConfig,
  QuickCreateFieldConfig,
  QuickCreatePreset,
} from '../../models/quick-create-select';
import { resolveQuickCreateConfig } from '../../utils/quick-create-select.registry';
import { LayoutCampo } from '../layout-campo/layout-campo';
import {
  CampoMetodoDTO,
  MetodoPrecificacaoMetaDTO,
} from '../../models/metodo-precificacao-meta';

@Component({
  selector: 'app-select-cadastro-rapido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    TooltipModule,
    ToggleSwitchModule,
    LayoutCampo,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectCadastroRapido),
      multi: true,
    },
  ],
  templateUrl: './select-cadastro-rapido.html',
  styleUrl: './select-cadastro-rapido.scss',
})
export class SelectCadastroRapido implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: FlagOption[] = [];
  @Input() listEndpoint = '';
  @Input() optionLabelField = 'name';
  @Input() optionValueField = 'code';
  @Input() quickCreatePreset?: QuickCreatePreset;
  @Input() quickCreateConfig?: QuickCreateConfig;
  @Input() placeholder = 'Selecione';
  @Input() showClear = false;
  @Input() checkmark = false;
  @Input() filter = false;
  @Input() disabled = false;
  @Input() invalid = false;
  @Input() name = '';
  @Input() inputId = '';
  @Input() showQuickCreate = true;

  @Output() optionsChange = new EventEmitter<FlagOption[]>();
  @Output() selectionChange = new EventEmitter<unknown>();
  @Output() itemCreated = new EventEmitter<Record<string, unknown>>();

  value: unknown = null;
  dialogVisible = false;
  dialogLoading = false;
  dialogSaving = false;
  dialogErrors: Record<string, string> = {};
  form: Record<string, unknown> = {};
  fieldOptions: Record<string, FlagOption[]> = {};
  metodosPrecificacaoTemplates: MetodoPrecificacaoMetaDTO[] = [];
  camposMetodoPrecificacao: CampoMetodoDTO[] = [];
  configuracaoMetodo: Record<string, unknown> = {};

  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);
  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get quickCreate(): QuickCreateConfig | null {
    return resolveQuickCreateConfig(this.quickCreatePreset, this.quickCreateConfig);
  }

  get canQuickCreate(): boolean {
    return this.showQuickCreate && !!this.quickCreate;
  }

  get isMetodoPrecificacaoMode(): boolean {
    return this.quickCreate?.dynamicMode === 'empresa-metodo-precificacao';
  }

  readonly dialogBreakpoints = { '960px': '92vw', '640px': '96vw' };

  get dialogStyle(): Record<string, string> {
    const width = this.isMetodoPrecificacaoMode ? '32rem' : '28rem';
    return { width: `min(${width}, 92vw)` };
  }

  get dialogContentStyle(): Record<string, string> {
    return {
      overflow: 'visible',
      maxHeight: 'none',
    };
  }

  get opcoesMetodoPrecificacao(): FlagOption[] {
    return this.metodosPrecificacaoTemplates.map((metodo) => {
      const opt = new FlagOption();
      opt.code = metodo.idMetodoPrecificacao;
      opt.name = `${metodo.cdMetodoPrecificacao} — ${metodo.nmMetodoPrecificacao}`;
      opt.extra = metodo;
      return opt;
    });
  }

  get quickCreateFields(): QuickCreateFieldConfig[] {
    return this.quickCreate?.fields ?? [];
  }

  ngOnInit(): void {
    if (!this.options?.length && this.listEndpoint) {
      this.carregarOpcoes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listEndpoint'] && !changes['listEndpoint'].firstChange) {
      this.carregarOpcoes();
    }
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    this.cd.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cd.markForCheck();
  }

  onValueChange(value: unknown): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.selectionChange.emit(value);
  }

  abrirCadastroRapido(): void {
    const config = this.quickCreate;
    if (!config) {
      return;
    }
    this.dialogErrors = {};
    this.form = {};
    this.configuracaoMetodo = {};
    this.camposMetodoPrecificacao = [];
    for (const field of config.fields) {
      if (field.defaultValue !== undefined) {
        this.form[field.key] = field.defaultValue;
      }
    }
    this.dialogVisible = true;
    if (this.isMetodoPrecificacaoMode) {
      this.carregarMetodosPrecificacao();
      return;
    }
    this.carregarOpcoesDialogo();
  }

  fecharDialogo(): void {
    this.dialogVisible = false;
    this.dialogLoading = false;
    this.dialogSaving = false;
    this.dialogErrors = {};
    this.camposMetodoPrecificacao = [];
    this.configuracaoMetodo = {};
  }

  onMetodoPrecificacaoTemplateChange(idMetodo: unknown): void {
    const metodo = this.metodosPrecificacaoTemplates.find(
      (item) => item.idMetodoPrecificacao === Number(idMetodo)
    );
    this.camposMetodoPrecificacao = metodo?.campos ?? [];
    this.configuracaoMetodo = {};
    for (const campo of this.camposMetodoPrecificacao) {
      if (campo.tipo === 'BOOLEAN') {
        this.configuracaoMetodo[campo.nome] = false;
      }
    }
    this.cd.markForCheck();
  }

  private carregarMetodosPrecificacao(): void {
    this.dialogLoading = true;
    this.baseService.findAll('metodos-precificacao').subscribe({
      next: (res: unknown) => {
        this.metodosPrecificacaoTemplates = (res as MetodoPrecificacaoMetaDTO[]) ?? [];
        this.dialogLoading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.dialogLoading = false;
        this.cd.markForCheck();
      },
    });
  }

  salvarCadastroRapido(): void {
    const config = this.quickCreate;
    if (!config || !this.validarDialogo()) {
      return;
    }

    this.dialogSaving = true;

    const montarPayload = (sequencia?: string): Record<string, unknown> => {
      const form: Record<string, unknown> = this.isMetodoPrecificacaoMode
        ? {
            idMetodoPrecificacao: this.form['idMetodoPrecificacao'],
            configuracao: { ...this.configuracaoMetodo },
          }
        : { ...this.form };
      if (sequencia && config.sequenceField) {
        form[config.sequenceField] = sequencia;
      }
      return config.preparePayload ? config.preparePayload(form) : form;
    };

    const save$ =
      config.useSequence && config.sequenceField
        ? this.baseService.findSequence(config.endpoint).pipe(
            switchMap((seq) =>
              this.baseService.save(config.endpoint, montarPayload(seq?.sequencia), undefined)
            )
          )
        : this.baseService.save(config.endpoint, montarPayload(), undefined);

    save$.subscribe({
      next: (res: unknown) => {
        const item = this.extrairItemSalvo(res);
        if (item) {
          this.itemCreated.emit(item);
        }
        this.dialogSaving = false;
        this.dialogVisible = false;
        this.carregarOpcoes().then(() => {
          const novoValor = item?.[config.valueField];
          if (novoValor != null) {
            this.onValueChange(novoValor);
          }
          this.cd.markForCheck();
        });
      },
      error: () => {
        this.dialogSaving = false;
        this.cd.markForCheck();
      },
    });
  }

  private validarDialogo(): boolean {
    const config = this.quickCreate;
    if (!config) {
      return false;
    }
    this.dialogErrors = {};
    let ok = true;

    if (this.isMetodoPrecificacaoMode) {
      if (!this.form['idMetodoPrecificacao']) {
        this.dialogErrors['idMetodoPrecificacao'] = 'Modelo é obrigatório';
        ok = false;
      }
      for (const campo of this.camposMetodoPrecificacao) {
        if (!campo.obrigatorio) {
          continue;
        }
        const valor = this.configuracaoMetodo[campo.nome];
        if (campo.tipo === 'BOOLEAN') {
          continue;
        }
        if (valor === null || valor === undefined || String(valor).trim() === '') {
          this.dialogErrors[campo.nome] = `${campo.label} é obrigatório`;
          ok = false;
        }
      }
      return ok;
    }

    for (const field of config.fields) {
      if (!field.required) {
        continue;
      }
      const valor = this.form[field.key];
      if (valor === null || valor === undefined || String(valor).trim() === '') {
        this.dialogErrors[field.key] = `${field.label} é obrigatório`;
        ok = false;
      }
    }
    return ok;
  }

  private carregarOpcoes(): Promise<void> {
    if (!this.listEndpoint) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.baseService.findAll(this.listEndpoint).subscribe({
        next: (res: unknown) => {
          this.options = this.mapearOpcoes(res);
          this.optionsChange.emit(this.options);
          this.cd.markForCheck();
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  private carregarOpcoesDialogo(): void {
    const config = this.quickCreate;
    if (!config) {
      return;
    }
    this.dialogLoading = true;
    const camposComEndpoint = config.fields.filter((f) => f.optionsEndpoint);
    if (!camposComEndpoint.length) {
      for (const field of config.fields) {
        if (field.options?.length) {
          this.fieldOptions[field.key] = field.options;
        }
      }
      this.dialogLoading = false;
      return;
    }

    let pendentes = camposComEndpoint.length;
    for (const field of config.fields) {
      if (field.options?.length) {
        this.fieldOptions[field.key] = field.options;
      }
    }

    for (const field of camposComEndpoint) {
      this.baseService.findAll(field.optionsEndpoint!).subscribe({
        next: (res: unknown) => {
          const lista = Array.isArray(res) ? res : [];
          this.fieldOptions[field.key] = lista.map((item) => {
            const opt = new FlagOption();
            const code = String(item);
            opt.code = code;
            opt.name = field.optionsLabelMap?.[code] ?? code;
            return opt;
          });
          pendentes -= 1;
          if (pendentes <= 0) {
            this.dialogLoading = false;
            this.cd.markForCheck();
          }
        },
        error: () => {
          pendentes -= 1;
          if (pendentes <= 0) {
            this.dialogLoading = false;
            this.cd.markForCheck();
          }
        },
      });
    }
  }

  private mapearOpcoes(res: unknown): FlagOption[] {
    const lista = Array.isArray(res) ? res : [];
    return lista.map((item: Record<string, unknown>) => {
      const opt = new FlagOption();
      opt.code = item[this.optionValueField] as string | number;
      opt.name = String(item[this.optionLabelField] ?? opt.code);
      opt.extra = item;
      return opt;
    });
  }

  private extrairItemSalvo(res: unknown): Record<string, unknown> | null {
    if (!res || typeof res !== 'object') {
      return null;
    }
    return res as Record<string, unknown>;
  }

  opcoesDoCampo(field: QuickCreateFieldConfig): FlagOption[] {
    return this.fieldOptions[field.key] ?? field.options ?? [];
  }
}
