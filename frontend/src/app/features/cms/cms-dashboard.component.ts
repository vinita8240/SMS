import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-cms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './cms-dashboard.component.html',
  styleUrls: ['./cms-dashboard.component.css'],})
export class CmsDashboardComponent implements OnInit {
  private api = inject(ApiService);
  stats = signal<any>(null);

  ngOnInit() {
    this.api.get<any>('/cms/dashboard').subscribe(res => {
      if (res.success && res.data) {
        this.stats.set(res.data);
      }
    });
  }
}
