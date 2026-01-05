import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-layout-card-config',
  imports: [DividerModule, ButtonModule, CardModule],
  templateUrl: './layout-card-config.html',
  styleUrl: './layout-card-config.scss',
})
export class LayoutCardConfig {

  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon: string = 'pi pi-cog';

  salvar() {

  }
}
