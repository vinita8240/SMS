import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ChatMessage, ChatResponse, ChatSuggestion } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly CONVERSATION_KEY = 'sms_ai_conversation_id';
  private readonly MESSAGES_KEY = 'sms_ai_messages_cache';

  // Signals
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  conversationId = signal<string>(this.getInitialConversationId());
  messages = signal<ChatMessage[]>(this.getInitialMessages());
  suggestions = signal<ChatSuggestion[]>([]);

  constructor() {
    this.loadSuggestions();
  }

  private getInitialConversationId(): string {
    const stored = localStorage.getItem(this.CONVERSATION_KEY);
    if (stored) return stored;
    const newId = 'conv_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem(this.CONVERSATION_KEY, newId);
    return newId;
  }

  private getInitialMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }

    const defaultGreeting: ChatMessage = {
      sender: 'bot',
      message: 'Hello! I am your **School AI Assistant**. Ask me anything about school timings, admissions, facilities, notices, attendance, exam marks, or fee balance!',
      timestamp: new Date()
    };
    return [defaultGreeting];
  }

  private saveMessages(msgs: ChatMessage[]) {
    this.messages.set(msgs);
    try {
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(msgs));
    } catch {
      // Ignore storage errors
    }
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  openChat() {
    this.isOpen.set(true);
  }

  closeChat() {
    this.isOpen.set(false);
  }

  loadSuggestions(): void {
    this.http.get<ApiResponse<ChatSuggestion[]>>(`${environment.apiUrl}/ai/suggestions`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.suggestions.set(res.data);
        }
      }),
      catchError(() => {
        // Fallback default suggestions
        this.suggestions.set([
          { label: '📋 Admissions', prompt: 'What is the admission process?' },
          { label: '🕒 Timings', prompt: 'What are the school timings?' },
          { label: '🔬 Facilities', prompt: 'What facilities does the school have?' },
          { label: '💰 Fees', prompt: 'What is the fee structure?' },
          { label: '📢 Notices', prompt: 'What are the latest notices?' }
        ]);
        return of(null);
      })
    ).subscribe();
  }

  sendMessage(text: string): Observable<ApiResponse<ChatResponse> | null> {
    const trimmed = text.trim();
    if (!trimmed) return of(null);

    const userMsg: ChatMessage = {
      sender: 'user',
      message: trimmed,
      timestamp: new Date()
    };

    const currentMsgs = [...this.messages(), userMsg];
    this.saveMessages(currentMsgs);
    this.isLoading.set(true);

    const payload = {
      message: trimmed,
      conversationId: this.conversationId()
    };

    return this.http.post<ApiResponse<ChatResponse>>(`${environment.apiUrl}/ai/chat`, payload).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          if (res.data.conversationId) {
            this.conversationId.set(res.data.conversationId);
            localStorage.setItem(this.CONVERSATION_KEY, res.data.conversationId);
          }

          const botMsg: ChatMessage = {
            sender: 'bot',
            message: res.data.answer,
            intent: res.data.intent,
            sources: res.data.sources,
            timestamp: new Date(res.data.timestamp || Date.now())
          };

          this.saveMessages([...this.messages(), botMsg]);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        const errorMsg: ChatMessage = {
          sender: 'bot',
          message: 'Sorry, I encountered a temporary issue connecting to the school knowledge base. Please try asking your question again.',
          timestamp: new Date()
        };
        this.saveMessages([...this.messages(), errorMsg]);
        return of(null);
      })
    );
  }

  clearChat(): void {
    const newId = 'conv_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    this.conversationId.set(newId);
    localStorage.setItem(this.CONVERSATION_KEY, newId);
    localStorage.removeItem(this.MESSAGES_KEY);

    const user = this.authService.currentUser();
    const name = user?.name ? ` ${user.name}` : '';
    const welcomeMsg: ChatMessage = {
      sender: 'bot',
      message: `Chat history cleared. Hello${name}! How can I assist you with school information, academics, or records today?`,
      timestamp: new Date()
    };

    this.saveMessages([welcomeMsg]);
    this.loadSuggestions();
  }

  sendFeedback(rating: 'up' | 'down', messageId?: number, comment?: string): Observable<any> {
    const payload = {
      conversationId: this.conversationId(),
      messageId,
      rating,
      comment
    };
    return this.http.post(`${environment.apiUrl}/ai/feedback`, payload).pipe(
      catchError(() => of(null))
    );
  }
}

