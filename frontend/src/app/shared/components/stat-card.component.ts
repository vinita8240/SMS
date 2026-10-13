import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() subtitle?: string;
  @Input() icon: string = '📊';
  @Input() colorClass: string = 'bg-brand-500';
  @Input() badgeClass: string = 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400';
  @Input() isCurrency: boolean = false;
  @Input() isPercent: boolean = false;
}
