import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

@Component({
  selector: 'app-count-us',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './count-us.html',
  styleUrl: './count-us.scss',
})

export class CountUsPage {

  submitted = signal(false);
  loading   = signal(false);

  form: ContactForm = {
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  };

  categories = [
    { value: 'general',     label: 'General Inquiry',      icon: 'chat_bubble' },
    { value: 'bug',         label: 'Bug Report',           icon: 'bug_report' },
    { value: 'complaint',   label: 'Complaint',            icon: 'report_problem' },
    { value: 'billing',     label: 'Billing & Payment',    icon: 'credit_card' },
    { value: 'feature',     label: 'Feature Request',      icon: 'lightbulb' },
    { value: 'account',     label: 'Account Issue',        icon: 'manage_accounts' },
  ];

  contactChannels = [
    {
      icon: 'mail',
      label: 'Email Support',
      value: 'yousefzuainat@gmail.com',
      sub: 'Reply within 24 hours',
      color: '#a4e6ff',
      href: 'mailto:yousefzuainat@gmail.com',
    },
    {
      icon: 'chat',
      label: 'Live Chat',
      value: 'Available 9 AM – 6 PM',
      sub: 'Instant support on weekdays',
      color: '#6ee7b7',
      href: '#',
    },
    {
      icon: 'phone_in_talk',
      label: 'Phone',
      value: '+962  780487794',
      sub: 'Sun – Thu, 9 AM – 5 PM',
      color: '#ddb7ff',
      href: 'tel:+962780487794',
    },
    {
      icon: 'location_on',
      label: 'Office',
      value: 'Amman, Jordan',
      sub: 'HQ — Visit by appointment',
      color: '#fbbf24',
      href: '#',
    },
  ];

  faqs = [
    {
      q: 'How do I reset my password?',
      a: 'Go to the login page and click "Forgot Password". You\'ll receive a reset link via email within minutes.',
    },
    {
      q: 'How do I cancel my premium subscription?',
      a: 'Head to Settings → Subscription and click "Cancel Plan". Your access continues until the billing period ends.',
    },
    {
      q: 'My XP didn\'t update after completing a task. What should I do?',
      a: 'Try refreshing the dashboard. If the issue persists, contact us with your user ID so we can investigate.',
    },
    {
      q: 'Can I export my data?',
      a: 'Yes! Go to Settings → Data Export to download a full copy of your habits, tasks, and notes.',
    },
  ];

  openFaq = signal<number | null>(null);

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? null : i);
  }

  getSelectedCategory() {
    return this.categories.find(c => c.value === this.form.category);
  }

  onSubmit() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.loading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.loading.set(false);
      this.submitted.set(true);
    }, 1800);
  }

  resetForm() {
    this.submitted.set(false);
    this.form = { name: '', email: '', subject: '', category: 'general', message: '' };
  }
}
