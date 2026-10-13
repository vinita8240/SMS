import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PublicSiteService } from './services/public-site.service';
import { ThemeOneComponent } from './themes/theme-1/theme-one.component';
import { ThemeTwoComponent } from './themes/theme-2/theme-two.component';
import { ThemeThreeComponent } from './themes/theme-3/theme-three.component';
import { ThemeFourComponent } from './themes/theme-4/theme-four.component';
import { ThemeFiveComponent } from './themes/theme-5/theme-five.component';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ThemeOneComponent,
    ThemeTwoComponent,
    ThemeThreeComponent,
    ThemeFourComponent,
    ThemeFiveComponent
  ],
  templateUrl: './public-shell.component.html'
})
export class PublicShellComponent implements OnInit {
  publicService = inject(PublicSiteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  isActivating = signal<boolean>(false);
  activeThemeId = signal<number>(1);
  previewThemeParam = signal<number | null>(null);

  allThemes = [
    { id: 1, name: 'Modern Academic' },
    { id: 2, name: 'Premium School' },
    { id: 3, name: 'Colorful Education' },
    { id: 4, name: 'Institutional' },
    { id: 5, name: 'Minimal / Modern' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const preview = params['preview_theme'] ? parseInt(params['preview_theme'], 10) : null;
      this.previewThemeParam.set(preview);
      this.loadSite(preview);
    });
  }

  loadSite(previewId?: number | null) {
    this.publicService.getHomepageData(previewId).subscribe(res => {
      if (res && res.data?.site?.theme) {
        this.activeThemeId.set(res.data.site.theme.theme_id);
      }
    });
  }

  switchPreview(themeId: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { preview_theme: themeId },
      queryParamsHandling: 'merge'
    });
  }

  activateCurrentPreview() {
    const themeId = this.previewThemeParam() || this.activeThemeId();
    this.isActivating.set(true);
    this.api.post(`/cms/themes/${themeId}/activate`, {}).subscribe({
      next: () => {
        this.isActivating.set(false);
        this.router.navigate(['/site'], { queryParams: {} });
      },
      error: () => {
        this.isActivating.set(false);
      }
    });
  }
}
