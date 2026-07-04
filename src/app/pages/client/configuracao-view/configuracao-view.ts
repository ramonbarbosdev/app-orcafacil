import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ConfigEmpresa } from './config-empresa/config-empresa';
import { ConfigOrcamento } from './config-orcamento/config-orcamento';
import { ConfigNotificacao } from './config-notificacao/config-notificacao';
import { ConfigMetodoPrecificacao } from './config-metodo-precificacao/config-metodo-precificacao';
import { ConfigMetodoAjuste } from './config-metodo-ajuste/config-metodo-ajuste';
import { ConfigOrganizacaoLogo } from './config-organizacao-logo/config-organizacao-logo';

@Component({
  selector: 'app-configuracao-view',
  imports: [
    CommonModule,
    TabsModule,
    ConfigOrcamento,
    ConfigNotificacao,
    ConfigMetodoPrecificacao,
    ConfigMetodoAjuste,
    ConfigOrganizacaoLogo,
    ConfigEmpresa,
  ],
  templateUrl: './configuracao-view.html',
  styleUrl: './configuracao-view.scss',
})
export class ConfiguracaoView {}
