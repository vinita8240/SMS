import { Component, inject, signal, viewChild, ElementRef, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatMessage } from '../../../core/models/models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotComponent {
  chatbotService = inject(ChatbotService);
  authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  messageInput = signal<string>('');
  copiedIndex = signal<number | null>(null);
  ratedMessages = signal<Record<number, 'up' | 'down'>>({});

  messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');
  inputElement = viewChild<ElementRef<HTMLTextAreaElement>>('inputElement');

  constructor() {
    // Auto-scroll on new messages or loading state
    effect(() => {
      this.chatbotService.messages();
      this.chatbotService.isLoading();
      this.scrollToBottom();
    });

    // Reload suggestions when user logs in/out
    effect(() => {
      this.authService.currentUser();
      this.chatbotService.loadSuggestions();
    });
  }

  rateMessage(index: number, rating: 'up' | 'down'): void {
    const current = { ...this.ratedMessages() };
    current[index] = rating;
    this.ratedMessages.set(current);
    this.chatbotService.sendFeedback(rating).subscribe();
  }

  toggle(): void {
    this.chatbotService.toggleChat();
    if (this.chatbotService.isOpen()) {
      setTimeout(() => {
        this.inputElement()?.nativeElement?.focus();
        this.scrollToBottom();
      }, 100);
    }
  }

  send(): void {
    const text = this.messageInput().trim();
    if (!text || this.chatbotService.isLoading()) return;

    this.messageInput.set('');
    this.chatbotService.sendMessage(text).subscribe();
    this.scrollToBottom();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  useSuggestion(prompt: string): void {
    this.messageInput.set('');
    this.chatbotService.sendMessage(prompt).subscribe();
    this.scrollToBottom();
  }

  clearChat(): void {
    if (confirm('Clear this chat conversation?')) {
      this.chatbotService.clearChat();
    }
  }

  copyMessage(text: string, index: number): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messagesContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  /**
   * Safe parser for simple markdown into clean HTML
   */
  renderMarkdown(content: string): SafeHtml {
    if (!content) return '';

    let html = content
      // Escape HTML chars
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Blockquotes > text
      .replace(/^&gt;\s?(.*)$/gm, '<blockquote class="border-l-4 border-indigo-500 pl-3 my-2 italic text-slate-600 dark:text-slate-300">$1</blockquote>')
      // Links [text](url)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">$1</a>')
      // Code spans `code`
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

    // Parse simple Markdown tables
    if (html.includes('|')) {
      html = this.parseTables(html);
    }

    // Convert newlines to breaks where appropriate
    html = html.replace(/\n\n/g, '<div class="h-2"></div>');
    html = html.replace(/\n/g, '<br/>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private parseTables(text: string): string {
    const lines = text.split('\n');
    let inTable = false;
    let tableHtml = '';
    const outputLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Skip separator row (| :--- | :--- |)
        if (cells.every(c => /^:?-+:?$/.test(c))) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-3"><table class="min-w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">';
          tableHtml += '<thead class="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200"><tr>';
          cells.forEach(c => tableHtml += `<th class="px-2.5 py-1.5 text-left border-b border-slate-200 dark:border-slate-700">${c}</th>`);
          tableHtml += '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">';
          cells.forEach(c => tableHtml += `<td class="px-2.5 py-1.5 text-slate-700 dark:text-slate-300">${c}</td>`);
          tableHtml += '</tr>';
        }
      } else {
        if (inTable) {
          tableHtml += '</tbody></table></div>';
          outputLines.push(tableHtml);
          inTable = false;
          tableHtml = '';
        }
        outputLines.push(lines[i]);
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table></div>';
      outputLines.push(tableHtml);
    }

    return outputLines.join('\n');
  }
}
