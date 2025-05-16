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
  styleUrls: ['./register.component.css']
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
    if (!this.name || !this.surname || !this.email || !this.password || !this.phone) {
      this.toastr.error("Todos los campos son obligatorios", "Validación");
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
        console.log("Respuesta del servidor:", resp);
        this.toastr.success("Revisa tu correo para confirmar el registro", "Éxito");
        setTimeout(() => {
          this.router.navigateByUrl("/login");
        }, 1000);
      },
      error: (err) => {
        console.error("Error durante el registro:", err);
        const msg = err?.error?.message || "Hubo un error inesperado";
        this.toastr.error(msg, "Error");
      }
    });
  }
}

