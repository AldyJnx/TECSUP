import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: {
        appName: 'TechStore',
        nav: {
          dashboard: 'Dashboard',
          products: 'Productos',
          users: 'Usuarios',
          roles: 'Roles',
          stores: 'Tiendas',
          audit: 'Auditoría',
          logout: 'Cerrar sesión',
        },
        auth: {
          login: 'Iniciar sesión',
          register: 'Registrarse',
          email: 'Correo electrónico',
          password: 'Contraseña',
          fullName: 'Nombre completo',
          mfaCode: 'Código MFA',
          enterMfa: 'Ingresa el código de tu app autenticadora',
          loggingIn: 'Iniciando…',
          invalidCredentials: 'Credenciales inválidas',
        },
      },
    },
    en: {
      translation: {
        appName: 'TechStore',
        nav: {
          dashboard: 'Dashboard',
          products: 'Products',
          users: 'Users',
          roles: 'Roles',
          stores: 'Stores',
          audit: 'Audit',
          logout: 'Log out',
        },
        auth: {
          login: 'Log in',
          register: 'Sign up',
          email: 'Email',
          password: 'Password',
          fullName: 'Full name',
          mfaCode: 'MFA code',
          enterMfa: 'Enter the code from your authenticator app',
          loggingIn: 'Logging in…',
          invalidCredentials: 'Invalid credentials',
        },
      },
    },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
