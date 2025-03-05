/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password requirement: minimum 8 characters, at least one letter and one number
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

/**
 * Validates if the email format is correct
 * @param email Email to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validates if the password meets the minimum requirements
 * @param password Password to validate
 * @returns Whether the password is valid
 */
export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Validates if two passwords match
 * @param password First password
 * @param confirmPassword Second password for confirmation
 * @returns Whether the passwords match
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Get password validation error message based on the issue
 * @param password Password to validate
 * @returns Error message or null if password is valid
 */
export const getPasswordValidationError = (password: string): string | null => {
  if (!password) {
    return 'A senha é obrigatória';
  }
  
  if (password.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres';
  }
  
  if (!/[A-Za-z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra';
  }
  
  if (!/\d/.test(password)) {
    return 'A senha deve conter pelo menos um número';
  }
  
  return null; // Password is valid
};

/**
 * Login form validation
 * @param email User email
 * @param password User password
 * @returns Object with validation result and error message
 */
export const validateLoginForm = (email: string, password: string): { 
  isValid: boolean; 
  error?: string;
} => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }
  
  return { isValid: true };
};

/**
 * Signup form validation
 * @param email User email
 * @param password User password
 * @param confirmPassword Password confirmation
 * @returns Object with validation result and error message
 */
export const validateSignupForm = (
  email: string, 
  password: string, 
  confirmPassword: string
): { 
  isValid: boolean; 
  error?: string;
} => {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }
  
  const passwordError = getPasswordValidationError(password);
  if (passwordError) {
    return { isValid: false, error: passwordError };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'As senhas não coincidem' };
  }
  
  return { isValid: true };
};
