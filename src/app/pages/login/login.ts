import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  loading: boolean = false;
  error: string = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Email and password required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.auth.getRole();
        console.log('ROLE AFTER LOGIN:', role);
        console.log('TOKEN AFTER LOGIN:', this.auth.getToken());

        if (role === 'Manager') {
          this.router.navigate(['/houses']);
        } else if (role === 'Resident') {
          this.router.navigate(['/resident/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}