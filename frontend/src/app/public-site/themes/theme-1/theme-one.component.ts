import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicSiteService, PublicHomeData } from '../../services/public-site.service';

@Component({
  selector: 'app-theme-one',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './theme-one.component.html'
})
export class ThemeOneComponent {
  @Input() data!: PublicHomeData;
  publicService = inject(PublicSiteService);

  isMobileMenuOpen = false;
  activeBannerIndex = 0;

  inquiryForm = {
    name: '',
    email: '',
    phone: '',
    subject: 'Admissions Inquiry (Theme 1)',
    message: ''
  };
  isSubmitting = false;
  submitMessage = '';

  nextBanner() {
    if (!this.data?.banners?.length) return;
    this.activeBannerIndex = (this.activeBannerIndex + 1) % this.data.banners.length;
  }

  prevBanner() {
    if (!this.data?.banners?.length) return;
    this.activeBannerIndex = (this.activeBannerIndex - 1 + this.data.banners.length) % this.data.banners.length;
  }

  onSubmitInquiry() {
    if (!this.inquiryForm.name || !this.inquiryForm.email || !this.inquiryForm.message) return;
    this.isSubmitting = true;
    this.publicService.submitInquiry(this.inquiryForm).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.submitMessage = 'Thank you! Your inquiry has been submitted successfully.';
        this.inquiryForm = { name: '', email: '', phone: '', subject: 'Admissions Inquiry (Theme 1)', message: '' };
        setTimeout(() => this.submitMessage = '', 6000);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Inquiry submitted. Our team will contact you soon.';
      }
    });
  }
}
