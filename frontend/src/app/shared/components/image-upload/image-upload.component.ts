import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],})
export class ImageUploadComponent {
  @Input() imageUrl: string = '';
  @Output() imageUrlChange = new EventEmitter<string>();
  
  @Input() previewHeightClass: string = 'h-32';
  @Input() showUrlInput: boolean = true;

  private api = inject(ApiService);
  private notify = inject(NotificationService);

  isUploading = signal<boolean>(false);

  // Compute the full URL for display if it's a relative path from the backend
  displayUrl = computed(() => {
    if (!this.imageUrl) return '';
    if (this.imageUrl.startsWith('http')) {
      return this.imageUrl;
    }
    // If it's a relative URL from our backend, prefix with API base URL minus /api
    return environment.apiUrl.replace('/api', '') + this.imageUrl;
  });

  onUrlChange(newUrl: string) {
    this.imageUrl = newUrl;
    this.imageUrlChange.emit(newUrl);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Basic validation
      if (file.size > 10 * 1024 * 1024) {
        this.notify.error('File is too large. Max size is 10MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.notify.error('Only image files are allowed.');
        return;
      }

      this.uploadFile(file);
      
      // Reset input so the same file can be selected again if needed
      input.value = '';
    }
  }

  private uploadFile(file: File) {
    this.isUploading.set(true);
    
    const formData = new FormData();
    formData.append('image', file);

    this.api.upload<any>('/cms/upload', formData).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        if (res.success && res.data && res.data.url) {
          this.notify.success('Image uploaded successfully');
          this.imageUrl = res.data.url;
          this.imageUrlChange.emit(this.imageUrl);
        } else {
          this.notify.error(res.message || 'Failed to upload image');
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.notify.error(err.message || 'An error occurred during upload');
      }
    });
  }
}
