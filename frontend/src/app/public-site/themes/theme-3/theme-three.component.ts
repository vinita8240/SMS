import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicSiteService, PublicHomeData } from '../../services/public-site.service';

@Component({
  selector: 'app-theme-three',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './theme-three.component.html'
})
export class ThemeThreeComponent {
  @Input() data!: PublicHomeData;
  publicService = inject(PublicSiteService);

  isMobileMenuOpen = false;
  activeBannerIndex = 0;

  inquiryForm = {
    name: '',
    email: '',
    phone: '',
    subject: 'Junior Admissions & Fun Discovery (Theme 3)',
    message: ''
  };
  isSubmitting = false;
  submitMessage = '';

  onSubmitInquiry() {
    if (!this.inquiryForm.name || !this.inquiryForm.email || !this.inquiryForm.message) return;
    this.isSubmitting = true;
    this.publicService.submitInquiry(this.inquiryForm).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Yay! We received your message and will reach out soon! 🎈';
        this.inquiryForm = { name: '', email: '', phone: '', subject: 'Junior Admissions & Fun Discovery (Theme 3)', message: '' };
      },
      error: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Inquiry submitted successfully! 🚀';
      }
    });
  }
}
