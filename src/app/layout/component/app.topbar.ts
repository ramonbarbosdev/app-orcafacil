import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { Menu } from 'primeng/menu';
import { AuthService } from '../../auth/auth.service';
import { OrganizacaoLogoService } from '../../services/organizacao-logo.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    Menu,
    AvatarModule,
  ],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        (click)="layoutService.onMenuToggle()"
      >
        <i class="pi pi-bars"></i>
      </button>
      <a class="layout-topbar-logo" [routerLink]="auth.isSuperAdmin() ? '/admin/home' : '/client/home'">
        <span class="layout-topbar-brand-slot">
          <img
            *ngIf="logoOrganizacaoUrl; else logoPadrao"
            [src]="logoOrganizacaoUrl"
            alt="Logo da empresa"
            class="layout-topbar-brand-logo"
          />
          <ng-template #logoPadrao>
            <img src="/logo.png" alt="OrçaFácil" class="layout-topbar-brand-logo" />
          </ng-template>
        </span>
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button
          type="button"
          class="layout-topbar-action"
          title="Atualizar permissões"
          [disabled]="recarregandoPermissoes"
          (click)="recarregarPermissoes()"
        >
          <i
            class="pi"
            [ngClass]="recarregandoPermissoes ? 'pi-spin pi-spinner' : 'pi-refresh'"
          ></i>
        </button>
        <button
          type="button"
          class="layout-topbar-action"
          (click)="toggleDarkMode()"
        >
          <i
            [ngClass]="{
              'pi ': true,
              'pi-moon': layoutService.isDarkTheme(),
              'pi-sun': !layoutService.isDarkTheme()
            }"
          ></i>
        </button>
        <div class="relative">
          <!-- <button
            class="layout-topbar-action layout-topbar-action-highlight"
            pStyleClass="@next"
            enterFromClass="hidden"
            enterActiveClass="animate-scalein"
            leaveToClass="hidden"
            leaveActiveClass="animate-fadeout"
            [hideOnOutsideClick]="true"
          >
            <i class="pi pi-palette"></i>
          </button> -->
          <!-- <app-configurator /> -->
        </div>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        pStyleClass="@next"
        enterFromClass="hidden"
        enterActiveClass="animate-scalein"
        leaveToClass="hidden"
        leaveActiveClass="animate-fadeout"
        [hideOnOutsideClick]="true"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">

          <div>
            <p-menu #menu [popup]="true" [model]="menuPerfil"></p-menu>
            <button
              type="button"
              class="flex items-center gap-2 p-1 rounded  hover:bg-[var(--surface-hover)]"
              (click)="menu.toggle($event)"
            >
              <p-avatar [image]="avatarImg" shape="circle">
                <i *ngIf="!avatarImg" class="pi pi-user"></i>
              </p-avatar>
              <span>{{ avatarNome }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- <app-confirm-dialog
      [(displayConfirmation)]="displayConfirmation"
      [title]="confirmationTitle"
      [message]="confirmationMessage"
      [onConfirm]="confirmationAction"
    /> -->
  </div>`,
})
export class AppTopbar {
  items!: MenuItem[];

  constructor(public layoutService: LayoutService) {}
  private router = inject(Router);
  auth = inject(AuthService);
  private logoService = inject(OrganizacaoLogoService);
  private cd = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  public avatarImg: string = '';
  public avatarNome: string = '';
  public logoOrganizacaoUrl: string | null = null;
  recarregandoPermissoes = false;

  ngOnInit() {
    this.auth.user$.subscribe((user) => {
      if (user?.tipoGlobal === 'SUPER_ADMIN') {
        this.avatarNome = 'Super Admin';
        this.logoOrganizacaoUrl = null;
      } else {
        this.avatarNome = user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'USER' ? 'Usuário' : 'Usuário';
        if (user?.idOrganizacao) {
          this.carregarLogoOrganizacao();
        } else {
          this.logoOrganizacaoUrl = null;
        }
      }
      this.cd.markForCheck();
    });

    this.logoService.atualizacao$.subscribe(() => {
      if (!this.auth.isSuperAdmin() && this.auth.hasOrgSelected()) {
        this.carregarLogoOrganizacao();
      }
    });
  }

  private carregarLogoOrganizacao(): void {
    if (!this.auth.hasPermission('organizacao.ler')) {
      this.logoOrganizacaoUrl = null;
      return;
    }
    this.logoService.obterBlobPreviewAutenticado().subscribe({
      next: (url) => {
        this.logoOrganizacaoUrl = url;
        this.cd.markForCheck();
      },
      error: () => {
        this.logoOrganizacaoUrl = null;
        this.cd.markForCheck();
      },
    });
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  displayConfirmation: boolean = false;
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  confirmationAction: () => void = () => {};

  openConfirmation(title: string, message: string, action: () => void) {
    this.confirmationTitle = title;
    this.confirmationMessage = message;
    this.confirmationAction = action;
    this.displayConfirmation = true;
  }

  logout() {
    this.auth.logout();
  }

  recarregarPermissoes() {
    if (this.recarregandoPermissoes || !this.auth.isAuthenticated()) {
      return;
    }

    this.recarregandoPermissoes = true;
    this.auth.refreshPermissoes().subscribe({
      next: () => {
        this.recarregandoPermissoes = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Permissões atualizadas',
          detail: 'Menu e acessos foram sincronizados com o servidor.',
        });
        this.cd.markForCheck();
      },
      error: () => {
        this.recarregandoPermissoes = false;
        this.cd.markForCheck();
      },
    });
  }

  menuPerfil = [
    {
      label: 'Perfil',
      icon: 'pi pi-fw pi-user',
      command: () => {
        this.router.navigate(['client/perfil']);
      },
    },
    {
      label: 'Atualizar permissões',
      icon: 'pi pi-fw pi-refresh',
      command: () => {
        this.recarregarPermissoes();
      },
    },
    // {
    //   label: 'Configuração',
    //   icon: 'pi pi-fw pi-cog',
    // },
    {
      separator: true,
    },
    {
      label: 'Sair',
      icon: 'pi pi-fw pi-sign-out',
      command: () => {
        this.logout();
      },
    },
  ];
}
