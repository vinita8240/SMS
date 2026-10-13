import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicSiteService, CmsNews } from '../services/public-site.service';

@Component({
  selector: 'app-public-news',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-news.component.html',
  styleUrls: ['./public-news.component.css'],})
export class PublicNewsComponent implements OnInit {
  private publicService = inject(PublicSiteService);
  news = signal<CmsNews[]>([]);

  ngOnInit() {
    this.publicService.getNews(50).subscribe(res => {
      if (res.success && res.data) {
        this.news.set(res.data);
      }
    });
  }
}
