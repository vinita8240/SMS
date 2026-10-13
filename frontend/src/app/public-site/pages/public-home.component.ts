import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicSiteService } from '../services/public-site.service';
import { ThemeOneComponent } from '../themes/theme-1/theme-one.component';
import { ThemeTwoComponent } from '../themes/theme-2/theme-two.component';
import { ThemeThreeComponent } from '../themes/theme-3/theme-three.component';
import { ThemeFourComponent } from '../themes/theme-4/theme-four.component';
import { ThemeFiveComponent } from '../themes/theme-5/theme-five.component';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [
    CommonModule,
    ThemeOneComponent,
    ThemeTwoComponent,
    ThemeThreeComponent,
    ThemeFourComponent,
    ThemeFiveComponent
  ],
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.css'],})
export class PublicHomeComponent implements OnInit {
  publicService = inject(PublicSiteService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const preview = params['preview_theme'] ? parseInt(params['preview_theme'], 10) : null;
      this.publicService.getHomepageData(preview).subscribe();
    });
  }
}
