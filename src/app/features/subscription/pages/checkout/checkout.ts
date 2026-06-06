import { Component, inject, ChangeDetectorRef }  from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { Router }              from '@angular/router';
import { HttpClient }          from '@angular/common/http';
import { ToastrService }       from 'ngx-toastr';

@Component({
  selector:    'app-checkout',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls:   ['./checkout.scss'],
})
export class CheckoutComponent {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr    = inject(ChangeDetectorRef);

  cardholderName = '';
  cardNumber     = '';
  expiration     = '';
  cvc            = '';
  selectedPlan   = 'annual'; // default

  isLoading = false;

  get planName(): string {
    if (this.selectedPlan === 'monthly') return 'Monthly';
    if (this.selectedPlan === 'tactical') return 'Tactical';
    return 'Annual';
  }

  get planPrice(): number {
    if (this.selectedPlan === 'monthly') return 20;
    if (this.selectedPlan === 'tactical') return 50;
    return 180;
  }

  get planTax(): number {
    return this.planPrice * 0.05;
  }

  get planTotal(): number {
    return this.planPrice + this.planTax;
  }

  selectPlan(plan: string): void {
    this.selectedPlan = plan;
  }

  onSubmit(): void {
    if (!this.cardholderName || !this.cardNumber || !this.expiration || !this.cvc) {
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    // Parse expiration MM/YY
    const parts = this.expiration.split('/');
    if (parts.length !== 2) {
      this.toastr.error('The expiration date format must be MM/YY (example: 12/29)', 'Validation Error');
      return;
    }

    const expMonth = parseInt(parts[0], 10);
    const expYearStr = parts[1].trim();
    // Support both 2-digit and 4-digit years
    let expYear = parseInt(expYearStr, 10);
    if (expYearStr.length === 2) {
      expYear = 2000 + expYear;
    }

    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12 || isNaN(expYear)) {
      this.toastr.error('Invalid expiration date.', 'Validation Error');
      return;
    }

    const body = {
      cardNumber: this.cardNumber.replace(/\s+/g, ''),
      expMonth: expMonth,
      expYear: expYear,
      cvc: this.cvc.trim(),
      planType: this.selectedPlan
    };

    this.isLoading = true;

    this.http.post<any>('http://localhost:5066/api/Subscription/checkout', body)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          localStorage.setItem('isPremium', 'true');
          this.toastr.success('Your account has been upgraded to Premium successfully!', '  Upgrade to Premium');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          const errorMsg = err.error?.message || 'Payment failed. Please check your card details.';
          this.toastr.error(errorMsg, 'Payment failed');
          this.cdr.detectChanges();
        }
      });
  }
}
