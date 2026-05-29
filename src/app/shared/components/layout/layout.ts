
import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

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
export class Layout implements OnInit {

  isSidebarOpen = signal(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  userName = 'User';

  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isSidebarOpen.set(false);
    }
  }

  navGroups = [
    {
      title: 'Core',
      links: [
        { label: 'Dashboard',  route: '/dashboard', icon: 'dashboard' },
        { label: 'Analytics',  route: '/analytics', icon: 'monitoring' }
      ]
    },
    {
      title: 'Productivity',
      links: [
        { label: 'Habits',     route: '/habits',    icon: 'cached' },
        { label: 'Tasks',      route: '/tasks',     icon: 'check_box' },
        { label: 'Pomodoro',   route: '/pomodoro',  icon: 'timer' },
        { label: 'Projects',   route: '/projects',  icon: 'account_tree' }
      ]
    },
    {
      title: 'Social',
      links: [
        { label: 'Challenges',  route: '/challenges',icon: 'military_tech' },
        { label: 'Leaderboard', route: '/leaderboard',icon: 'leaderboard' },
        { label: 'Friends',     route: '/friends',   icon: 'person' },
        { label: 'Teams',       route: '/teams',     icon: 'groups' }
      ]
    }
  ];

  bottomLinks = [
    { label: 'Settings',     route: '/settings',     icon: 'settings' },
    { label: 'Subscription', route: '/subscription', icon: 'workspace_premium' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
  }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
    }
  }
}
