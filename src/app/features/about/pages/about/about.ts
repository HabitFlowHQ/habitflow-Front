import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutPage {

  teamMembers = [
    {
      name: 'Yousef Zuainat',
      role: 'Lead Developer & Architect',
      icon: 'code',
      color: '#a4e6ff',
      gradient: 'from-[#a4e6ff]/20 to-[#a4e6ff]/5',
      border: 'border-[#a4e6ff]/20',
      description: 'Full-stack engineer passionate about building systems that help people grow.',
      skills: ['Angular', 'ASP.NET Core', 'System Design'],
    },
    {
      name: 'Sara Khalid',
      role: 'UI/UX Designer & Frontend',
      icon: 'palette',
      color: '#ddb7ff',
      gradient: 'from-[#ddb7ff]/20 to-[#ddb7ff]/5',
      border: 'border-[#ddb7ff]/20',
      description: 'Crafting beautiful, intuitive interfaces that users love to interact with.',
      skills: ['Figma', 'Angular', 'CSS Architecture'],
    },
    {
      name: 'Omar Nasser',
      role: 'Backend Engineer & DevOps',
      icon: 'dns',
      color: '#6ee7b7',
      gradient: 'from-[#6ee7b7]/20 to-[#6ee7b7]/5',
      border: 'border-[#6ee7b7]/20',
      description: 'Infrastructure wizard keeping systems fast, reliable, and scalable.',
      skills: ['C# / .NET', 'SQL Server', 'Azure'],
    },
    {
      name: 'Lina Mahmoud',
      role: 'Product Manager & QA',
      icon: 'manage_accounts',
      color: '#fbbf24',
      gradient: 'from-[#fbbf24]/20 to-[#fbbf24]/5',
      border: 'border-[#fbbf24]/20',
      description: 'Bridging the gap between vision and execution with precision.',
      skills: ['Agile', 'Testing', 'Product Strategy'],
    },
  ];

  values = [
    {
      icon: 'bolt',
      label: 'Performance First',
      desc: 'Every feature is engineered for speed and reliability.',
      color: '#a4e6ff',
    },
    {
      icon: 'psychology',
      label: 'Science-Based',
      desc: 'Built on proven habit formation and productivity research.',
      color: '#ddb7ff',
    },
    {
      icon: 'favorite',
      label: 'User-Centric',
      desc: 'Your growth is the only metric that matters to us.',
      color: '#f87171',
    },
    {
      icon: 'lock',
      label: 'Privacy by Design',
      desc: 'Your data stays yours — always secure, always private.',
      color: '#6ee7b7',
    },
  ];

  milestones = [
    { year: '2024', event: 'Project Kickoff', desc: 'LevelUP was conceived as a final-year capstone project.' },
    { year: '2025', event: 'Alpha Launch', desc: 'First internal release with core habit & task modules.' },
    { year: '2026', event: 'Public Beta', desc: 'Premium features, XP system, and team collaboration launched.' },
  ];
}
