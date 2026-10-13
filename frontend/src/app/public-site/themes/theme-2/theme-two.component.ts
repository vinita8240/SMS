import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicSiteService, PublicHomeData } from '../../services/public-site.service';

@Component({
  selector: 'app-theme-two',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './theme-two.component.html'
})
export class ThemeTwoComponent {
  @Input() data!: PublicHomeData;
  publicService = inject(PublicSiteService);

  isMobileMenuOpen = false;
  activeBannerIndex = 0;

  inquiryForm = {
    name: '',
    email: '',
    phone: '',
    subject: 'Executive Admissions Tour (Theme 2)',
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
        this.submitMessage = 'Thank you. Our admissions dean will be in touch shortly.';
        this.inquiryForm = { name: '', email: '', phone: '', subject: 'Executive Admissions Tour (Theme 2)', message: '' };
      },
      error: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Inquiry received.';
      }
    });
  }
}
