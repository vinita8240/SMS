import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon: string = '📂';
  @Input() title: string = 'No records found';
  @Input() message: string = 'There are no items matching your criteria yet.';
  @Input() actionText?: string;
  @Output() action = new EventEmitter<void>();
}
