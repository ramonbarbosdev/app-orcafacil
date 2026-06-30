import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfigEmpresa } from './config-empresa/config-empresa';
import { ConfigOrcamento } from './config-orcamento/config-orcamento';
import { ConfigNotificacao } from './config-notificacao/config-notificacao';
import { ConfigMetodoPrecificacao } from './config-metodo-precificacao/config-metodo-precificacao';
import { ConfigCampoPersonalizado } from './config-campo-personalizado/config-campo-personalizado';
import { ConfigMetodoAjuste } from './config-metodo-ajuste/config-metodo-ajuste';
import { ConfigOrganizacaoLogo } from './config-organizacao-logo/config-organizacao-logo';

@Component({
  selector: 'app-configuracao-view',
  imports: [
    CommonModule,
    DividerModule,
    ButtonModule,
    CardModule,
    FormsModule,
    InputTextModule,
    ConfigOrcamento,
    ConfigNotificacao,
    ConfigMetodoPrecificacao,
    ConfigCampoPersonalizado,
    ConfigMetodoAjuste,
    ConfigOrganizacaoLogo,
    ConfigEmpresa,
  ],
  templateUrl: './configuracao-view.html',
  styleUrl: './configuracao-view.scss',
})
export class ConfiguracaoView {}
