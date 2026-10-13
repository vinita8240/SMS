import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicSiteService } from '../services/public-site.service';

@Component({
  selector: 'app-public-dynamic-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-dynamic-page.component.html',
  styleUrls: ['./public-dynamic-page.component.css'],})
export class PublicDynamicPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private publicService = inject(PublicSiteService);

  page = signal<any>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.isLoading.set(true);
        this.publicService.getPage(slug).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success && res.data) {
              this.page.set(res.data);
            }
          },
          error: () => this.isLoading.set(false)
        });
      }
    });
  }
}
