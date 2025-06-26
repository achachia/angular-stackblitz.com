import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MagazineService } from './../../api.service';
import { StorageService } from './../../storage.service';
import { Router } from '@angular/router';
import { AuthService } from './../../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private magazineService: MagazineService,
    private storage: StorageService,
    public router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    console.log('Tentative de connexion :', email, password);

    // Exemple fictif d’authentification
    if (email && password) {
      this.errorMessage = '';

      this.magazineService.getIdentificationUser(email, password).subscribe({
        next: (response: any) => {
          console.log('Réponse JSON complète:', response);

          this.storage.set('user', { token: response.token });
          this.authService.setLoggedIn(true);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des magazines:', error);
        },
      });

      // alert('Connexion réussie !');
      // Redirection, stockage token, etc.
    } else {
      this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
    }
  }
}
