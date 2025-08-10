export class AuthValidators {
  static email(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  }

  static username(username: string): string | null {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers and underscores';
    }
    return null;
  }

  static password(password: string): string | null {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain a special character';
    return null;
  }

  static confirmPassword(password: string, confirmPassword: string): string | null {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  // ✅ CAMBIO: Renombrado de 'name' a 'validateName' para evitar conflicto con Function.prototype.name
  static validateName(name: string, fieldName: string): string | null {
    if (!name) return null; // Los nombres son opcionales
    if (name.length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (name.length > 50) {
      return `${fieldName} must be less than 50 characters`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens and apostrophes`;
    }
    return null;
  }

  // Métodos adicionales útiles
  static phoneNumber(phone: string): string | null {
    if (!phone) return null; // Opcional
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return 'Invalid phone number format';
    }
    return null;
  }

  static url(url: string): string | null {
    if (!url) return null; // Opcional
    try {
      new URL(url);
      return null;
    } catch {
      return 'Invalid URL format';
    }
  }
}
