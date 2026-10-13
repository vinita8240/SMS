import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicSiteService, CmsEvent } from '../services/public-site.service';

@Component({
  selector: 'app-public-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-events.component.html',
  styleUrls: ['./public-events.component.css'],})
export class PublicEventsComponent implements OnInit {
  private publicService = inject(PublicSiteService);
  events = signal<CmsEvent[]>([]);

  ngOnInit() {
    this.publicService.getEvents(50).subscribe(res => {
      if (res.success && res.data) {
        this.events.set(res.data);
      }
    });
  }
}
