import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LayoutCardConfig } from './layout-card-config/layout-card-config';

@Component({
  selector: 'app-configuracao-view',
  imports: [DividerModule, ButtonModule, CardModule, LayoutCardConfig],
  templateUrl: './configuracao-view.html',
  styleUrl: './configuracao-view.scss',
})
export class ConfiguracaoView {

  salvar()
  {

  }
}
