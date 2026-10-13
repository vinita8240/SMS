import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal<boolean>(false);
  isUserLogin = signal<boolean>(false);

  loginForm: FormGroup = this.fb.group({
    username: ['admin@school.com', [Validators.required]],
    password: ['admin123', [Validators.required]]
  });

  ngOnInit() {
    this.updateModeFromUrl();

    // Listen to router navigation to update login mode automatically
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateModeFromUrl();
    });
  }

  private updateModeFromUrl() {
    const url = this.router.url;
    const isUser = url.includes('userlogin') || this.route.snapshot.data['mode'] === 'user';
    this.isUserLogin.set(isUser);

    if (isUser) {
      this.loginForm.patchValue({ username: 'student@school.com', password: 'student123' });
    } else {
      this.loginForm.patchValue({ username: 'admin@school.com', password: 'admin123' });
    }
  }

  fillRole(username: string, pass: string) {
    this.loginForm.patchValue({ username, password: pass });
  }

  onForgotPassword() {
    this.notify.info('Password Reset', 'Please contact your School IT Administrator to reset your credentials.');
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const val = this.loginForm.value;

    this.auth.login({
      username: val.username,
      email: val.username,
      password: val.password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notify.error('Authentication Failed', err.error?.message || 'Invalid username or password.');
      }
    });
  }
}
