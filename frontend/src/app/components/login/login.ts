import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email    = '';
  password = '';
  error    = '';
  loading  = false;
  showPass = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);
  }

  submit() {
    this.error   = '';
    this.loading = true;

    const payload: LoginRequest = {
      email:    this.email.trim(),
      password: this.password,
    };

    this.auth.loginViaApi(payload).subscribe(result => {
      this.loading = false;
      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.error = result.error || 'Ошибка входа';
      }
    });
  }
}