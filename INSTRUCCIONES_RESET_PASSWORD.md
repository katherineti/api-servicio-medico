# Funcionalidad de Restablecimiento de Contraseña

## Endpoints Implementados

### 1. Solicitar Restablecimiento de Contraseña
**POST** `/auth/forgot-password`

**Body:**
\`\`\`json
{
  "email": "usuario@ejemplo.com"
}
\`\`\`

**Respuesta:**
\`\`\`json
{
  "ok": true,
  "message": "Si el correo existe, recibirás un enlace de restablecimiento",
  "token": "abc123..." // Solo en desarrollo
}
\`\`\`

### 2. Restablecer Contraseña con Token
**POST** `/auth/reset-password`

**Body:**
\`\`\`json
{
  "token": "abc123...",
  "newPassword": "NuevaContraseña123!",
  "confirmPassword": "NuevaContraseña123!"
}
\`\`\`

**Respuesta:**
\`\`\`json
{
  "ok": true,
  "message": "Contraseña restablecida exitosamente"
}
\`\`\`

## Características de Seguridad

1. **Token único y seguro**: Generado con 32 bytes aleatorios
2. **Expiración**: Los tokens expiran en 1 hora
3. **Uso único**: El token se elimina después de usarlo
4. **Validación fuerte**: La nueva contraseña debe cumplir requisitos de seguridad
5. **No revelar información**: No se indica si el email existe o no

## Validaciones de Contraseña

- Mínimo 8 caracteres
- Máximo 50 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial (@$!%*?&)

## Flujo de Uso

1. Usuario olvida su contraseña
2. Usuario ingresa su email en `/auth/forgot-password`
3. Sistema genera un token y lo envía (en producción, por email)
4. Usuario recibe el token y lo usa en `/auth/reset-password` con su nueva contraseña
5. Sistema valida el token y actualiza la contraseña

## Importante para Producción

⚠️ **Actualmente el token se retorna en la respuesta solo para desarrollo.**

En producción, debes:

1. **Integrar un servicio de email** (ej: SendGrid, Nodemailer, AWS SES)
2. **Eliminar la propiedad `token`** de la respuesta de forgot-password
3. **Enviar el token por email** al usuario con un enlace como:
   \`\`\`
   https://tu-app.com/reset-password?token=abc123...
   \`\`\`
4. **Considerar usar una base de datos** en lugar de Map en memoria para tokens (para escalabilidad)
5. **Implementar limpieza automática** de tokens expirados con un cron job

## Ejemplo de Tabla para Base de Datos (Opcional)

Si quieres persistir los tokens en la BD:

\`\`\`sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Testing

### Probar solicitud de restablecimiento:
\`\`\`bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}'
\`\`\`

### Probar restablecimiento con token:
\`\`\`bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_RECIBIDO",
    "newPassword":"NuevaPass123!",
    "confirmPassword":"NuevaPass123!"
  }'
