import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CmsTheme {
  theme_id: number;
  theme_name: string;
  slug: string;
  description: string;
  preview_image: string;
  is_active: number;
  is_default: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  border_radius: string;
  config_json?: any;
}

export interface CmsSettings {
  setting_id?: number;
  school_name: string;
  tagline: string;
  school_logo: string;
  favicon: string;
  principal_name: string;
  principal_title: string;
  principal_message: string;
  principal_image: string;
  address: string;
  phone: string;
  emergency_phone: string;
  email: string;
  website: string;
  social_links_json?: any;
  maps_embed_url?: string;
  footer_text: string;
  copyright_text: string;
  header_style: string;
  admissions_open: number;
}

export interface CmsMenuItem {
  menu_id: number;
  parent_id?: number | null;
  title: string;
  route?: string;
  external_url?: string;
  target?: string;
  display_order: number;
  is_active: number;
  is_mega_menu?: number;
  badge?: string;
  icon?: string;
  children?: CmsMenuItem[];
}

export interface CmsSection {
  section_id: number;
  section_key: string;
  title: string;
  subtitle: string;
  content: string;
  layout_style: string;
  display_order: number;
  is_enabled: number;
  background_type: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  config_json?: any;
}

export interface CmsBanner {
  banner_id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  badge_text?: string;
  button_text?: string;
  button_url?: string;
  secondary_btn_text?: string;
  secondary_btn_url?: string;
  display_order: number;
  is_active: number;
}

export interface CmsNews {
  news_id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string;
  category: string;
  is_featured: number;
  is_published: number;
  published_at: string;
}

export interface CmsEvent {
  event_id: number;
  title: string;
  slug: string;
  description: string;
  venue: string;
  start_date: string;
  end_date?: string;
  time: string;
  image_url: string;
  category: string;
  registration_url?: string;
  is_published: number;
}

export interface CmsGalleryItem {
  gallery_id: number;
  category_id?: number;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
  media_type: string;
  category_name?: string;
}

export interface CmsFacility {
  facility_id: number;
  title: string;
  description: string;
  icon: string;
  image_url: string;
}

export interface CmsTestimonial {
  testimonial_id: number;
  author_name: string;
  author_role: string;
  author_avatar: string;
  content: string;
  rating: number;
}

export interface PublicHomeData {
  site: {
    theme: CmsTheme;
    settings: CmsSettings;
    menus: CmsMenuItem[];
  };
  sections: CmsSection[];
  banners: CmsBanner[];
  stats: any;
  classes: any[];
  facilities: CmsFacility[];
  news: CmsNews[];
  events: CmsEvent[];
  notices: any[];
  gallery: CmsGalleryItem[];
  testimonials: CmsTestimonial[];
  settings: CmsSettings;
}

@Injectable({
  providedIn: 'root'
})
export class PublicSiteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/public`;

  currentTheme = signal<CmsTheme | null>(null);
  siteSettings = signal<CmsSettings | null>(null);
  siteMenus = signal<CmsMenuItem[]>([]);
  homeData = signal<PublicHomeData | null>(null);
  isLoading = signal<boolean>(false);
  previewThemeId = signal<number | null>(null);

  getSiteBundle(previewId?: number | null): Observable<any> {
    const params: any = {};
    if (previewId) {
      params.preview_theme = previewId;
    }
    return this.http.get<any>(`${this.apiUrl}/site`, { params }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentTheme.set(res.data.theme);
          this.siteSettings.set(res.data.settings);
          this.siteMenus.set(res.data.menus || []);
          this.applyThemeStyles(res.data.theme);
        }
      })
    );
  }

  getHomepageData(previewId?: number | null): Observable<any> {
    this.isLoading.set(true);
    const params: any = {};
    if (previewId) {
      params.preview_theme = previewId;
    }
    return this.http.get<any>(`${this.apiUrl}/home`, { params }).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.homeData.set(res.data);
          if (res.data.site?.theme) {
            this.currentTheme.set(res.data.site.theme);
            this.siteSettings.set(res.data.settings);
            this.siteMenus.set(res.data.site.menus || []);
            this.applyThemeStyles(res.data.site.theme);
          }
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        return of({ success: false, error: err });
      })
    );
  }

  getPage(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pages/${slug}`);
  }

  getNews(limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/news`, { params: { limit } });
  }

  getNewsBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/news/${slug}`);
  }

  getEvents(limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events`, { params: { limit } });
  }

  getGallery(categoryId?: number): Observable<any> {
    const params: any = {};
    if (categoryId) params.category_id = categoryId;
    return this.http.get<any>(`${this.apiUrl}/gallery`, { params });
  }

  submitInquiry(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contact`, data);
  }

  setPreviewTheme(themeId: number | null) {
    this.previewThemeId.set(themeId);
    this.getHomepageData(themeId).subscribe();
  }

  applyThemeStyles(theme: CmsTheme) {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary_color || '#1e3a8a');
    root.style.setProperty('--theme-secondary', theme.secondary_color || '#f8fafc');
    root.style.setProperty('--theme-accent', theme.accent_color || '#dc2626');
    root.style.setProperty('--theme-radius', theme.border_radius || '8px');
    root.style.setProperty('--theme-font', theme.font_family || 'Inter');
  }
}
