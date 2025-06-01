import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name: string = '';
  surname: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  register() {
    if (
      !this.name ||
      !this.surname ||
      !this.email ||
      !this.password ||
      !this.phone
    ) {
      this.toastr.error("Validación", "Necesitas ingresar todos los campos");
      return;
    }

    const data = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      phone: this.phone,
    };

    this.authService.register(data).subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.toastr.success("Éxito", "Ingresa a tu correo para poder completar tu registro");
        setTimeout(() => {
          this.router.navigateByUrl("/login");
        }, 500);
      },
      error: (err: any) => {
        console.error(err);

        let parsedError: any;

        // Verifica si error es un string JSON y lo parsea
        try {
          parsedError = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
        } catch (e) {
          parsedError = {};
        }

        const emailTaken =
          parsedError.email &&
          Array.isArray(parsedError.email) &&
          parsedError.email.includes("The email has already been taken.");

        if (emailTaken) {
          this.toastr.error("Este correo ya está registrado. Por favor inicia sesión.");
          setTimeout(() => {
            this.router.navigateByUrl("/login");
          }, 1500);
        } else {
          this.toastr.error("Error", "Verifica los datos ingresados.");
        }
      }
    });
  }
}
