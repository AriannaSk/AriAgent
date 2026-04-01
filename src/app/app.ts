import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { ManagerSidebarComponent } from './components/manager-sidebar/manager-sidebar';
import { ResidentSidebarComponent } from './components/resident-sidebar/resident-sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ManagerSidebarComponent,
    ResidentSidebarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  showSettings = false;
  isDark = false;
  currentUrl = '';

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    this.currentUrl = this.router.url;

    const savedTheme = localStorage.getItem('theme');
    this.isDark = savedTheme === 'dark';

    if (this.isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  isLoginPage(): boolean {
    return this.currentUrl === '/login';
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;

    if (this.isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}