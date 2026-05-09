import { test, expect } from '@playwright/test';

test.describe('Flujo de login', () => {
  test('admin inicia sesión y llega al dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    await page.getByLabel(/correo/i).fill('admin@techstore.com');
    await page.getByLabel(/contraseña/i).fill('Password!123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/Hola, Ana Admin/i)).toBeVisible();
  });

  test('credenciales inválidas muestran error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill('admin@techstore.com');
    await page.getByLabel(/contraseña/i).fill('wrong-password');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible({ timeout: 5000 });
  });

  test('empleado no ve el menú de Roles', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill('employee.lima@techstore.com');
    await page.getByLabel(/contraseña/i).fill('Password!123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.getByRole('link', { name: /productos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^roles$/i })).toHaveCount(0);
  });
});
