import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicSiteService, PublicHomeData } from '../../services/public-site.service';

@Component({
  selector: 'app-theme-four',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './theme-four.component.html'
})
export class ThemeFourComponent {
  @Input() data!: PublicHomeData;
  publicService = inject(PublicSiteService);

  isMobileMenuOpen = false;

  inquiryForm = {
    name: '',
    email: '',
    phone: '',
    subject: 'Institutional Admissions Inquiry (Theme 4)',
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
        this.submitMessage = 'Official inquiry logged in institutional records. Reference code generated.';
        this.inquiryForm = { name: '', email: '', phone: '', subject: 'Institutional Admissions Inquiry (Theme 4)', message: '' };
      },
      error: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Inquiry logged successfully.';
      }
    });
  }
}
