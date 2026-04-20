import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  username        = '';
  email           = '';
  phone           = '';
  password        = '';
  confirmPassword = '';
  agreed          = false;

  showPass        = false;
  showConfirmPass = false;
  loading         = false;
  serverError     = '';
  fieldErrors: FieldErrors = {};

  get passwordStrength(): number {
    const p = this.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)            score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  get strengthLabel(): string {
    return ['', 'Слабый', 'Средний', 'Хороший', 'Надёжный'][this.passwordStrength];
  }

  get strengthColor(): string {
    return ['', '#e53935', '#ff9800', '#4EBC73', '#2e7d32'][this.passwordStrength];
  }

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  validate(): boolean {
    this.fieldErrors = {};
    let valid = true;

    if (!this.username.trim() || this.username.trim().length < 2) {
      this.fieldErrors.username = 'Введите имя (минимум 2 символа)';
      valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(this.email.trim())) {
      this.fieldErrors.email = 'Введите корректный email';
      valid = false;
    }

    if (this.password.length < 8) {
      this.fieldErrors.password = 'Пароль должен быть не менее 8 символов';
      valid = false;
    }

    if (this.password !== this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Пароли не совпадают';
      valid = false;
    }

    return valid;
  }

  submit() {
    this.serverError = '';
    if (!this.validate()) return;

    this.loading = true;

    const payload: RegisterRequest = {
      username: this.username.trim(),
      email:    this.email.trim().toLowerCase(),
      password: this.password,
      phone:    this.phone.trim() || undefined,
    };

    this.auth.registerViaApi(payload).subscribe(result => {
      this.loading = false;
      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.serverError = result.error || 'Ошибка регистрации';
      }
    });
  }

  clearFieldError(field: keyof FieldErrors) {
    delete this.fieldErrors[field];
  }
}