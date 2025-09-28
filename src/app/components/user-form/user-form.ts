import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user';
import { User, CreateUserRequest, UpdateUserRequest } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userForm: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  userId = signal<number | null>(null);

  // Computed to determine if we're in edit mode
  isEditMode = computed(() => this.userId() !== null);

  constructor() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      avatar: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(Number(id));
      this.loadUserForEdit();
    }
  }

  loadUserForEdit(): void {
    const id = this.userId();
    if (!id) return;

    this.loading.set(true);

    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.router.navigate(['/home']);
        this.loading.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
    if (field.errors['email']) return 'El email debe tener un formato válido';
    if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) return 'La imagen debe ser una URL válida (ejemplo: https://ejemplo.com/imagen.jpg)';

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'first_name': 'El nombre',
      'last_name': 'El apellido',
      'email': 'El email',
      'avatar': 'La imagen'
    };
    return labels[fieldName] || 'El campo';
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.submitting.set(true);
    const formData = this.userForm.value;

    if (this.isEditMode()) {
      this.updateUser(formData);
    } else {
      this.createUser(formData);
    }
  }

  private createUser(userData: CreateUserRequest): void {
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.router.navigate(['/home']);
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Create error:', error);
        this.submitting.set(false);
      }
    });
  }

  private updateUser(userData: UpdateUserRequest): void {
    const id = this.userId();
    if (!id) return;

    this.userService.updateUser(id, userData).subscribe({
      next: (response) => {
        this.router.navigate(['/user', id]);
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.submitting.set(false);
      }
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  // Helper to get preview avatar
  getAvatarPreview(): string {
    const avatarUrl = this.userForm.get('avatar')?.value;
    if (avatarUrl && avatarUrl.trim() !== '') {
      // Return the avatar URL even if validation fails for preview purposes
      return avatarUrl;
    }

    // For edit mode, if no avatar is set, try to generate one from user data
    if (this.isEditMode()) {
      const firstName = this.userForm.get('first_name')?.value || 'User';
      const lastName = this.userForm.get('last_name')?.value || 'Preview';
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`;
    }

    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=preview';
  }
}