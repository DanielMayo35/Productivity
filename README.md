# Productivity

Aplicación web (SPA) para productividad y gestión de clientes/empresas con módulos de:

- **Catálogo** (Empresas, Procedimientos y Actividades)
- **Operación** (tabla editable con columnas personalizables)
- **Dashboard** (resumen por Empresa y por Procedimiento)
- **Cuenta de correo** (configuración para envíos)

## Funcionalidades implementadas

1. **Catálogo**
   - Tabla de empresas con validación de campo obligatorio: **Empresa / Razón social**.
   - Tabla de procedimientos.
   - Tabla de actividades con vínculo al procedimiento.
   - Edición directa en tablas (`contenteditable`) y eliminación de filas.

2. **Módulo Operación**
   - Tabla base con columnas por defecto:
     - Empresa (desplegable)
     - Procedimiento (desplegable)
     - Actividades (desplegable)
     - Estatus
   - Posibilidad de agregar columnas adicionales tipo Monday-like:
     - Fechas, texto, URL, número, tiempo, prioridad, etiquetas, avance, etc.
   - Títulos de columnas editables para todas las columnas no bloqueadas.
   - Cronómetro play/pausa para la columna "Tiempo real".
   - Edición directa de celdas en la tabla.

3. **Importación/Layout**
   - Descarga de layout JSON de referencia.
   - Importación de datos desde archivo JSON con la misma estructura.

4. **Dashboard**
   - Resumen tipo tabla dinámica por empresa.
   - Resumen tipo tabla dinámica por procedimiento.
   - Tarjetas KPI (empresas, procedimientos, actividades y registros de operación).

5. **Correo**
   - Formulario para ligar/configurar cuenta de correo (proveedor, remitente, SMTP, TLS).

## Ejecutar localmente

Como es una SPA estática, puedes abrir `index.html` directamente o usar un servidor local:

```bash
python3 -m http.server 8000
```

Después abre:

- http://localhost:8000

## Estructura

- `index.html`: interfaz y módulos.
- `styles.css`: estilos.
- `app.js`: lógica de datos, render y persistencia con `localStorage`.
