import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicSiteService, CmsGalleryItem } from '../services/public-site.service';

@Component({
  selector: 'app-public-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-gallery.component.html',
  styleUrls: ['./public-gallery.component.css'],})
export class PublicGalleryComponent implements OnInit {
  private publicService = inject(PublicSiteService);

  categories = signal<any[]>([]);
  allItems = signal<CmsGalleryItem[]>([]);
  selectedCategory = signal<number | null>(null);

  filteredItems = () => {
    const cat = this.selectedCategory();
    if (!cat) return this.allItems();
    return this.allItems().filter(i => i.category_id === cat);
  };

  ngOnInit() {
    this.publicService.getGallery().subscribe(res => {
      if (res.success && res.data) {
        this.categories.set(res.data.categories || []);
        this.allItems.set(res.data.items || []);
      }
    });
  }

  filterCategory(catId: number | null) {
    this.selectedCategory.set(catId);
  }
}
