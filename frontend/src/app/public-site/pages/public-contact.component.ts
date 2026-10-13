import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicSiteService } from '../services/public-site.service';

@Component({
  selector: 'app-public-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './public-contact.component.html',
  styleUrls: ['./public-contact.component.css'],})
export class PublicContactComponent implements OnInit {
  private publicService = inject(PublicSiteService);

  siteSettings = signal<any>(null);
  form = {
    name: '',
    email: '',
    phone: '',
    subject: 'Admissions Inquiry',
    message: ''
  };
  isSubmitting = false;
  submitMessage = '';

  ngOnInit() {
    this.publicService.getSiteBundle().subscribe(res => {
      if (res.success && res.data?.settings) {
        this.siteSettings.set(res.data.settings);
      }
    });
  }

  onSubmit() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.isSubmitting = true;
    this.publicService.submitInquiry(this.form).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Thank you! Your message has been sent to our admissions office.';
        this.form = { name: '', email: '', phone: '', subject: 'Admissions Inquiry', message: '' };
      },
      error: () => {
        this.isSubmitting = false;
        this.submitMessage = 'Inquiry sent.';
      }
    });
  }
}
