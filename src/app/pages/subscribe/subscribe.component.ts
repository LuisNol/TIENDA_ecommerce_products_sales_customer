import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent implements OnInit {
  subscribeForm!: FormGroup;
  formspreeEndpoint = 'https://formspree.io/f/manovnoq';
  submitted = false;
  errorSending = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.subscribeForm = this.fb.group({
      mensaje: ['Tienes un nuevo suscriptor en AvisoOnline con el siguiente correo:'],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.subscribeForm.valid) {
      const formData = this.subscribeForm.value;
      this.http.post(this.formspreeEndpoint, formData, {
        headers: new HttpHeaders({ 'Accept': 'application/json' })
      }).subscribe({
        next: () => {
          this.submitted = true;
          this.errorSending = false;
          this.subscribeForm.reset();
        },
        error: () => {
          this.submitted = false;
          this.errorSending = true;
        }
      });
    } else {
      this.submitted = false;
      this.errorSending = true;
    }
  }
}
