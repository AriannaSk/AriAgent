import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-resident-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './resident-sidebar.html',
  styleUrls: ['./resident-sidebar.css']
})
export class ResidentSidebarComponent {
  @Input() showSettings = false;
  @Input() isDark = false;

  @Output() toggleSettingsClick = new EventEmitter<void>();
  @Output() toggleThemeClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
}