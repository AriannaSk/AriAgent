import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-manager-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './manager-sidebar.html',
  styleUrls: ['./manager-sidebar.css']
})
export class ManagerSidebarComponent {
  @Input() showSettings = false;
  @Input() isDark = false;

  @Output() toggleSettingsClick = new EventEmitter<void>();
  @Output() toggleThemeClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
}