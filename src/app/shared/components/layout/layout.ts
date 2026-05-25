
import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {

  isSidebarOpen = signal(true);

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  navLinks = [
    { label: 'Dashboard',  route: '/dashboard', icon: '🏠' },
    { label: 'Habits',     route: '/habits',    icon: '🔥' },
    { label: 'Tasks',      route: '/tasks',     icon: '✅' },
  ];
}
