# Manual de usuario

**VOLTA Logistics** · Versión 2.0  
**Sitio:** [https://voltabs.mx](https://voltabs.mx)  
**Actualizado:** agosto 2026

---

## Índice

*(Índice alineado al manual impreso / Word)*

| N.º | Capítulo | Notas |
| --- | --- | --- |
| 1 | [Introducción](#1-introducción) | |
| 2 | [Objetivo del sistema](#2-objetivo-del-sistema) | |
| 3 | [Requisitos para utilizar la aplicación](#3-requisitos-para-utilizar-la-aplicación) | |
| 4 | [Roles y permisos](#4-roles-y-permisos) | |
| 5 | [Inicio de sesión](#5-inicio-de-sesión) | |
| 6 | [Registro de usuario](#6-registro-de-usuario) | |
| 7 | [Recuperar contraseña](#7-recuperar-contraseña) | |
| 8 | [Pantalla principal](#8-pantalla-principal) | Incluye [Inicio (avisos)](#9-inicio-avisos) — [lado operador](#lado-del-operador-y-ayudante-qué-visualiza) — y [Notificaciones](#16-notificaciones) |
| 9 | [Módulo de Viajes](#10-módulo-de-viajes) | [Crear viaje (Admin)](#procedimiento-para-crear-un-viaje-administrador) · [Ejecutar viaje (Operador)](#procedimiento-para-ejecutar-un-viaje-operador) · [Acompañante (Ayudante)](#procedimiento-para-el-acompañante-ayudante) · [Mis viajes](#pantalla-mis-viajes-qué-ve-el-operador) · [Hoja de viaje](#detalle-del-viaje-hoja-de-viaje-y-datos-del-servicio) · [Guía del Operador](#guía-del-operador-y-ayudante) |
| 10 | [Módulo de Facturas](#11-módulo-de-facturas) | |
| 11 | [Módulo Gastos](#12-módulo-gastos) | |
| 12 | [Módulo de Unidades](#13-módulo-de-unidades) | |
| 13 | [Módulo de Usuarios](#14-módulo-de-usuarios) | Admin + [lado operador / ayudante](#lado-del-operador-y-ayudante-módulo-usuarios) |
| 14 | [Módulo Perfil](#15-módulo-perfil) | |

**Anexos:** [Configuración del sistema](#17-configuración-del-sistema) · [Problemas frecuentes](#18-problemas-frecuentes)

---



## 1. Introducción

**VOLTA Logistics** es la aplicación para administrar la operación de la flota: viajes, unidades, operadores, viáticos, facturas y comunicación interna (avisos).

Puede usarse desde el navegador web ([https://voltabs.mx](https://voltabs.mx)) o desde la aplicación móvil en Android e iOS.

---



## 2. Objetivo del sistema

Centralizar el registro y seguimiento de cada viaje —desde la asignación hasta el cierre— y dar a oficina y personal de campo una sola fuente de información actualizada.

---



## 3. Requisitos para utilizar la aplicación

- Usuario registrado (creado por un administrador o por autoregistro de Operador).
- Conexión a Internet.
- Navegador actualizado (Chrome, Edge, Safari, Firefox) o app móvil.
- Correo electrónico, si se usa recuperación de contraseña o notificaciones por correo.

---



## 4. Roles y permisos

Además del **rol**, el sistema usa **permisos** que un administrador puede asignar por usuario.


| Rol               | Qué hace habitualmente                                        |
| ----------------- | ------------------------------------------------------------- |
| **Administrador** | Gestiona viajes, gastos, unidades, usuarios y avisos.         |
| **Operador**      | Ve **Mis viajes**, inicia/avanza/finaliza el recorrido y sube checklists, hoja de entrega, carta porte y bitácora. Detalle: [Guía del Operador](#guía-del-operador-y-ayudante). |
| **Ayudante**      | Ve los viajes donde va como **acompañante** (consulta / apoyo). Misma lógica de menú reducido que el operador. |




### Permisos especiales (se asignan por usuario)


| Permiso                         | Uso                                       |
| ------------------------------- | ----------------------------------------- |
| Ver / subir / eliminar facturas | Módulo **Facturas**                       |
| Configuración del sistema       | Precio DEF, correos, etc.                 |
| Asignar roles / permisos        | Solo usuarios autorizados en **Usuarios** |


> **Importante:** Facturas y Configuración del sistema **no** se habilitan solos solo por ser Administrador; deben asignarse de forma explícita.

---



## 5. Inicio de sesión

Al abrir la aplicación aparece la pantalla de acceso.

### Opciones

- Correo electrónico **o** nombre de usuario  
- Contraseña (mostrar / ocultar)  
- **¿Olvidaste tu contraseña?**  
- **Registrarse**



### Procedimiento

1. Escriba su correo o usuario.
2. Escriba su contraseña.
3. Presione **Iniciar sesión**.
4. Si los datos son correctos, entrará al panel principal.

> No hay autenticación de dos factores en el inicio de sesión. El código de 6 dígitos se usa **solo** para recuperar la contraseña.

---



## 6. Registro de usuario

Desde **Registrarse** en la pantalla de login. Este registro público crea cuentas con rol **Operador**, inactivas hasta que un administrador las active.

### Datos solicitados

- Nombre(s)  
- Apellido paterno (obligatorio)  
- Apellido materno (opcional)  
- Correo electrónico  
- Teléfono / contacto  
- Contraseña y confirmación (mín. 8 caracteres, con mayúscula y número)  
- Foto de perfil (opcional)



### Procedimiento

1. En login, pulse **Registrarse**.
2. Complete los datos.
3. Confirme la contraseña.
4. Pulse el botón de registro.
5. Si todo es correcto, se crea la cuenta **inactiva**. Un administrador debe activarla en **Usuarios** antes de que pueda iniciar sesión.



### Consideraciones

- El correo no debe estar ya registrado.
- El rol **Administrador** y **Ayudante General** se dan de alta solo desde el módulo **Usuarios**.
- Personal **sin acceso al sistema** (solo para asignar a viajes) también se crea desde **Usuarios**, sin correo/contraseña.

---



## 7. Recuperar contraseña

El flujo está en **dos pasos**: primero se valida el código; después se define la nueva contraseña.

### Procedimiento

1. En login, pulse **¿Olvidaste tu contraseña?**
2. Escriba el correo registrado y solicite el código.
3. Revise su bandeja (y spam). El código de **6 dígitos** dura aproximadamente **10 minutos**.
4. En la pantalla **Verifica tu código**, capture los 6 dígitos.
5. Pulse **Validar código**.
6. Si el código es correcto, aparecerá la sección **Nueva contraseña**.
7. Escriba la contraseña nueva (**mín. 8 caracteres, mayúscula y número**), confírmela y pulse **Guardar contraseña**.
8. Inicie sesión con la nueva clave.



### Opciones útiles

- **Cambiar correo** — vuelve a la pantalla anterior.

---



## 8. Pantalla principal

Después de iniciar sesión verá:

- **Menú lateral** (web) o menú inferior / drawer (móvil).
- **Migas de pan** (ejemplo: Inicio › Viajes).
- **Campana de notificaciones**.
- Acceso a **Perfil**.



### Secciones del menú (según permisos)


| Menú         | Quién lo ve                                 |
| ------------ | ------------------------------------------- |
| **Inicio**   | Todos                                       |
| **Viajes**   | Todos (cada quien ve lo que le corresponde) |
| **Facturas** | Quien tenga permiso de ver o subir facturas |
| **Gastos**   | Administrador o permiso de gastos           |
| **Unidades** | Administrador o permiso de unidades         |
| **Usuarios** | Administrador o permiso de usuarios         |
| **Perfil**   | Todos                                       |


---



## 9. Inicio (avisos)

Pantalla de **circulares y avisos** de la flota. Es la primera opción del menú (**Inicio**) para todos los roles.

### Qué puede ver cualquiera

- Lista de avisos (los **fijados / IMPORTANTE** aparecen primero).
- Título, contenido, autor, fecha e imagen (si hay).

### Qué puede hacer un administrador

1. Pulse **Crear Aviso**.
2. Capture **título** y **contenido** (obligatorios).
3. Opcional: marcar **Fijar aviso en la parte superior**.
4. Opcional: subir una imagen (se muestra completa, sin recortar).
5. Pulse **Guardar**.
6. Puede **editar** o **eliminar** avisos existentes.

Al publicar un aviso, el resto de usuarios recibe notificación en la **campana** (*Nuevo anuncio*).

### Lado del operador y ayudante (qué visualiza)

El operador / ayudante **solo lee** los avisos. No puede crear, editar ni eliminar.

#### Cómo entrar

1. Inicie sesión.
2. En el menú pulse **Inicio**.
3. Verá el encabezado de avisos / circulares de la flota y el listado.

#### Qué aparece en pantalla

| Elemento | Qué significa |
| --- | --- |
| Contador *(N avisos)* | Cuántos avisos hay publicados. |
| Tarjeta del aviso | Título, texto (vista previa), autor y fecha. |
| Etiqueta **IMPORTANTE** | Aviso **fijado** por administración; sale **primero** en la lista. |
| Imagen | Si el aviso tiene foto, se muestra completa (sin recortar). |
| *No hay avisos* | Aún no hay circulares publicadas. |

#### Qué **no** ve / no puede hacer

- No aparece el botón **Crear Aviso**.
- No hay iconos de editar ni eliminar en las tarjetas.
- No puede fijar ni quitar el marcado **IMPORTANTE**.

#### Cómo se entera de un aviso nuevo

1. Administración publica un aviso en **Inicio**.
2. Llega **Nuevo anuncio** a la **campana** (excepto a quien lo publicó).
3. Al pulsar esa notificación, la app abre **Inicio** para leer el aviso.
4. También puede entrar directo a **Inicio** y revisar el listado (los **IMPORTANTE** van arriba).

#### Resumen para capacitar

> *“En Inicio solo lee las circulares. Si algo es urgente verá IMPORTANTE arriba. Cuando publiquen un aviso nuevo le llega en la campana; al tocarla abre Inicio.”*

---



## 10. Módulo de Viajes

En este apartado se registra la información necesaria para dar seguimiento a cada viaje, así como la asignación de unidades, operadores y acompañantes.

> **Guía ilustrada con señalamientos:** consulte  
> `[docs/manual-viajes/MANUAL_SENALAMIENTOS.md](./docs/manual-viajes/MANUAL_SENALAMIENTOS.md)`  
> (plan de números ① ② ③… por captura: listado, formulario, fechas, Destino 2 y multidestino).



### Información solicitada

Orden aproximado en el formulario **Nuevo Viaje**:

- **Origen** y **Destino**
- **Cliente** (desplegable; al final de la lista: **Agregar**)
- **Unidad**
- **Remolque** (solo si la unidad lo requiere, p. ej. 002 o 007): Caja Seca o Lowboy; la placa se asigna automáticamente
- **Operador** y **Acompañante** (o *Sin acompañante*)
- **DEF entregado** y **Playo**
- **Carta porte** y **Bitácora de horas** (oficina u operador pueden verlas y subirlas)
- Checklists de inicio / recepción y **hoja de entrega** (seguimiento del operador)
- **Tarjeta** (desplegable; al final de la lista: **Agregar**)
- **Fechas y tiempo:**
  - Salida (fecha y hora)
  - Llegada estimada (opcional: mismo día o varios días)
  - Tiempo estimado (se calcula al completar salida y llegada)
- **¿Multidestino?** y destinos siguientes (lugar, fechas del tramo, unidad/operador si aplica)



### Pantalla del listado

En la pantalla principal del módulo de viajes se muestra el listado de los viajes registrados. Desde esta sección el administrador puede:

- Consultar el historial de viajes del periodo.
- Filtrar por **semana** (el filtro solo afecta lo visible en pantalla).
- Ver el contador de viajes **activos**.
- Crear un nuevo viaje con el botón **Crear viaje**.
- Editar la información de un viaje existente.
- Eliminar un viaje.
- **Exportar** un reporte en Excel con **todos** los viajes registrados (exportación global; no se limita a la semana seleccionada).

El operador y el ayudante visualizan únicamente **Mis viajes**: aquellos en los que están asignados como conductor o acompañante, respectivamente.

### Procedimiento para crear un viaje (Administrador)

Siga estos pasos en el orden del formulario. Para el plan de números en capturas, vea `[docs/manual-viajes/MANUAL_SENALAMIENTOS.md](./docs/manual-viajes/MANUAL_SENALAMIENTOS.md)`.

1. **Abrir el módulo**
  Ingrese a **Viajes** desde el menú. En la pantalla verá el historial, el filtro por **semana**, el contador de activos y el botón **Excel**.
2. **Crear viaje**
  Pulse **+ Crear viaje**. Se abre el modal **Nuevo Viaje** (*Completa los datos para registrar el viaje*). Use la **X** o **Cancelar** si desea salir sin guardar.
3. **Información general — Origen y Destino**
  - En **Origen**, busque o escriba el punto de salida.  
  - En **Destino**, busque o escriba el destino principal.
4. **Cliente**
  Abra **Seleccionar cliente** y elija el cliente (por ejemplo Toyota o Interlaken).  
   Si no está en la lista, al final del desplegable pulse **Agregar**, escriba el nombre y guarde el nuevo cliente.
5. **Unidad y remolque**
  - En **Unidad**, seleccione el tracto asignado.  
  - Si la unidad requiere remolque (p. ej. **002** o **007**), aparecerá el campo **Remolque**: elija **Caja Seca** o **Lowboy**. La **placa de remolque** se asigna automáticamente.
6. **Operador y acompañante**
  - En **Operador**, seleccione el conductor responsable.  
  - En **Acompañante**, elija un ayudante o la opción **Sin acompañante**.
7. **Destino y carga**
  Capture, si aplica:  
  - **DEF entregado**  
  - **Playo**
8. **Documentación**
  Adjunte la **Carta porte** (PDF, JPG o PNG) cuando corresponda.  
   La **Bitácora de horas** la puede subir la oficina o el operador; los checklists y la hoja de entrega los completa el operador al iniciar/finalizar.
9. **Tarjeta**
  En **Seleccionar tarjeta**, elija la tarjeta de combustible o gastos.  
   Si necesita una nueva, abra el desplegable y al final pulse **Agregar**, capture el nombre y guarde.
10. **Fechas y tiempo**
  En el bloque **Fechas y tiempo** (*Punto A → B · estimado para el operador*):  
  - **Salida (A):** capture **Fecha** (`DD/MM/AAAA`) y **Hora** (`HH:MM`).  
  - **Llegada estimada (B)** *(opcional):*  
    - **Mismo día:** solo indique la **horaria aproximada**.  
    - **Varios días:** capture fecha y hora de llegada.
  - Debajo verá el **Tiempo estimado** (por ejemplo `2h 30m`) cuando salida y llegada estén completas.  
  - El viaje queda **pendiente** para el operador; el estimado no lo marca como completado.
11. **Multidestino** *(solo si hay más de un punto de entrega)*
  Vea la sección **Cómo funciona el multidestino** más abajo. En resumen: active **¿Multidestino? → Sí**, agregue Destino 2, 3, etc. en orden, y guarde.
12. **Guardar**
  En la barra inferior: **Cancelar** (izquierda) cierra sin guardar; **Guardar** (derecha) registra el viaje.  
    El sistema notificará al **operador** y al **acompañante** asignados. El estado inicial será **Pendiente**.

### Procedimiento para ejecutar un viaje (Operador)

El operador **no crea** el viaje. Solo ejecuta los que le asignaron. Siga estos pasos en orden.

1. **Abrir el módulo**
  Ingrese a **Viajes** desde el menú. Verá únicamente **Mis viajes** (los que le asignaron como conductor), con el contador **N activo(s)** y el historial de *sus* viajes.  
  En la barra superior: **campana** (número si hay notificaciones) y su avatar.  
  No aparecen el botón **Crear viaje**, ni editar/eliminar de oficina, ni **Excel** de exportación global (eso es de administración).
2. **Ubicar el viaje**
  - Si está **Pendiente**: ábralo o pulse **Iniciar viaje**.  
  - Si ya está **EN CURSO** / en progreso: pulse **Continuar** (o la tarjeta).  
  - También puede llegar aviso en la **campana**: *Viaje asignado*.  
  - En la tarjeta verá origen → destino, fechas, unidad, cliente, acompañante y quién lo asignó.
3. **Revisar datos y documentos**
  En el detalle puede consultar: ruta, cliente, unidad, acompañante (si hay), fechas estimadas.  
  Si aplica, revise o suba **Carta porte** y, cuando corresponda, **Bitácora de horas**.
4. **Iniciar viaje**
  Pulse **Iniciar viaje**.  
  Se abre el **checklist de inicio** (opcional): marque Sí/No en cada punto y, si quiere, escriba **Observaciones**.  
  **No** se piden fotos en este checklist.  
  Confirme para iniciar. El viaje pasa a **En progreso** (Destino 1).
5. **En destino — checklist de recepción**
  Al llegar (o al registrar la recepción), complete el **checklist de recepción** del destino actual (Sí/No en cada punto).  
  Las **Observaciones** son **opcionales** (aunque marque algún **No**, puede guardar sin escribir nada).  
  Sin este checklist no podrá cerrar una parada intermedia en multidestino.
6. **Si el viaje es de un solo destino**
  Cuando termine la entrega:  
  - Pulse **Finalizar viaje**.  
  - Adjunte la(s) **hoja(s) de entrega** (foto o PDF; **obligatoria** al menos una). En **multidestino** puede subir **varias** (p. ej. una por recepción).  
  - Confirme. El viaje queda **Completado** y se notifica a administración.
7. **Si el viaje es multidestino** *(Destino 1, 2, 3…)*
  En pantalla puede verse **Destino 2 de 3**. Avance **uno por uno** (no puede saltar paradas).  
  El **checklist de inicio** solo al arrancar el viaje; al **Continuar destino 2+** **no** se vuelve a pedir (mismo operador).

  | Paso | Estado | Qué hace | Resultado |
  | --- | --- | --- | --- |
  | a | **En progreso** (Destino actual) | Completa **checklist de recepción** | Listo para cerrar esa parada |
  | b | Destino **intermedio** | **Finalizar destino / parada** (no use “Finalizar viaje”) | Pasa a **En parada** |
  | c | **En parada** | **Continuar destino N** (sin checklist de inicio) | **En progreso** en Destino 2, 3… |
  | d | Último destino | **Finalizar viaje** + **hoja de entrega** | **Completado** |

  Reglas:  
  - No cierre una parada intermedia sin su **checklist de recepción**.  
  - En el **último** destino no use “finalizar parada”: use **Finalizar viaje**.  
  - Si indica *Sin más destinos*, ya está en el último tramo.  
  - Detalle de oficina (cómo se arma el multidestino): vea **Cómo funciona el multidestino** más abajo.
8. **Documentos que maneja durante el recorrido**

  | Documento | Cuándo |
  | --- | --- |
  | Carta porte | Ver / subir (oficina o usted) |
  | Checklist de inicio | Al **Iniciar viaje** (opcional) |
  | Checklist de recepción | En cada destino / parada |
  | Hoja de entrega | Al **Finalizar viaje** (obligatoria; en multidestino puede subir varias) |
  | Bitácora de horas | Durante el viaje o al cerrar |

9. **Fin**
  Con el viaje **Completado**, ya no lo inicia de nuevo. Si necesita corrección de datos maestros, lo hace la oficina (administrador).

> **Ayudante:** ve los viajes donde va como **acompañante** (consulta / apoyo). El avance (**Iniciar**, paradas, **Finalizar**) lo lleva el **operador**.  
> Procedimiento completo del acompañante: [Procedimiento para el acompañante (Ayudante)](#procedimiento-para-el-acompañante-ayudante).

#### Resumen en pocas palabras

> *“Abra Mis viajes, inicie el pendiente con el checklist de inicio si quiere, haga la recepción en cada parada, y al final cierre con Finalizar viaje y la hoja de entrega. Si hay varios destinos, avance uno por uno.”*

---

### Procedimiento para el acompañante (Ayudante)

El **ayudante** no conduce el viaje en el sistema: va como **acompañante**. Su rol es **consulta y apoyo** al operador. **No** inicia, **no** cierra paradas ni **no** finaliza el viaje.

#### Idea clave

> *“Me asignan como acompañante → me llega aviso → abro Mis viajes → consulto el viaje y apoyo al operador. Él es quien pulsa Iniciar / Recepción / Finalizar.”*

#### Pasos

1. **Alta y acceso**
  Un administrador lo crea en **Usuarios** con rol **Ayudante** (correo y contraseña para entrar).  
  Detalle: [Lado del operador y ayudante (módulo Usuarios)](#lado-del-operador-y-ayudante-módulo-usuarios).
2. **Asignación**
  Al crear o editar el viaje, la oficina elige en **Acompañante** a este usuario (o **Sin acompañante**).  
  Llega la notificación **Vas como acompañante** en la **campana** (y correo si la oficina activó **Asignación**).
3. **Abrir Mis viajes**
  Entre a **Viajes**. Verá el subtítulo *Viajes donde vas asignado como acompañante*.  
  Solo aparecen viajes donde va como acompañante (no el listado de oficina ni **Crear viaje**).
4. **Abrir el viaje**
  Pulse la tarjeta o **Continuar** / ver detalle.  
  En pantalla verá la leyenda **Vas como acompañante** y el estado del viaje (*Pendiente de iniciar*, *En progreso*, *En parada*, *Completado*).
5. **Qué puede hacer**
  - Consultar **Hoja de viaje** y **Datos del servicio** (ruta, operador, unidad, fechas, multidestino, etc.).  
  - Ver documentos ya cargados (**Carta porte**, **Bitácora**, hojas de entrega cuando existan).  
  - Leer avisos en **Inicio** y su **Perfil** (datos y foto).  
  - Apoyar en campo al operador (físicamente); en la app solo consulta.
6. **Qué no puede hacer**
  - **Iniciar viaje** ni checklist de inicio.  
  - Checklist de **recepción**, **Finalizar destino** ni **Finalizar viaje**.  
  - Subir hoja(s) de entrega ni cambiar estado del viaje.  
  - Crear, editar o eliminar viajes; ni usar **Excel** de oficina.
7. **Multidestino**
  Puede ver el avance (Destino 1, 2…, **en parada**, etc.). El **operador** es quien continúa cada tramo y cierra al final.

#### Diferencia rápida Operador vs Acompañante

| | Operador (conductor) | Acompañante (ayudante) |
| --- | --- | --- |
| Cómo lo asignan | Campo **Operador** | Campo **Acompañante** |
| Notificación | *Viaje asignado* | *Vas como acompañante* |
| Mis viajes | *…asignados como operador* | *…asignado como acompañante* |
| Iniciar / recepción / finalizar | Sí | No (solo consulta) |
| Documentos del cierre | Él sube hoja(s) de entrega | Solo ve si ya están |

#### Frase para capacitar

> *“Si va de acompañante: mire el viaje en Mis viajes y apoye al conductor. Quien inicia y finaliza en la app es el operador.”*

---

### Cómo funciona el multidestino

#### Idea en una frase

> *Un viaje multidestino es **una sola hoja de viaje** con **varias entregas en fila**. El operador termina la 1, luego la 2, luego la 3… sin saltarse ninguna.*

Ejemplo fácil: sale de la planta, entrega en Toyota (Destino 1) y después sigue a CDMX (Destino 2). En pantalla verá algo como **Multidestino · 2 destinos** y **DESTINO 1** / **DESTINO 2/2**.

#### Comparación rápida


| | Entrega única | Multidestino |
| --- | --- | --- |
| Paradas | Solo 1 destino | 2 o más (Destino 1, 2, 3…) |
| Pastilla en la tarjeta | No aparece “Multidestino” | **Multidestino · N destinos** |
| Cómo cierra | **Finalizar viaje** + hoja de entrega | Cada parada intermedia se cierra; al **último** sí **Finalizar viaje** |
| Estado entre paradas | No aplica | **En parada** (pausa antes del siguiente) |

#### Qué ve el operador en pantalla (multidestino)

| En la app | Qué significa |
| --- | --- |
| **Multidestino · 2 destinos** (u otro N) | El viaje tiene varias entregas. |
| Círculos **1 · 2** | Orden de las paradas; el relleno es el tramo actual. |
| **DESTINO 1** / **DESTINO 2/2** | En qué parada va (ej. 2 de 2 = última). |
| Estado **en progreso** | Está trabajando esa entrega. |
| Estado **en parada** | Ya cerró una parada intermedia; hay **pausa**. |
| Texto *Pausa · Siguiente acción: Destino 2 de 2* | Le dice qué sigue. |
| Orden: *1) Toyota… → 2) Ciudad de México…* | La ruta completa en orden. |
| Botón **Continuar destino 2** | Arranca el siguiente tramo **sin** checklist de inicio. |
| **Datos del servicio** + **Documentación** | Igual que en un viaje simple: operador, unidad, carta porte, bitácora, etc. |

#### Cómo lo arma la oficina (administrador)

1. En **¿Multidestino?** elija **Sí**.  
2. Capture el **Destino 1** (el destino principal del formulario) con sus fechas.  
3. En **Destinos siguientes**, agregue **Destino 2**, **3**… (lugar + fechas; unidad/operador si aplica).  
4. **Guardar**. El operador verá el viaje como multidestino.

Detalle de campos: vea el procedimiento de **Crear viaje** (paso Multidestino).

#### Cómo lo vive el operador (guía simple)

Piense en cada destino como una “estación”. En cada una hace lo mismo, excepto en la última.

```
Pendiente
   ↓  Iniciar viaje (checklist de inicio opcional)
Destino 1 · En progreso
   ↓  Checklist de recepción → Finalizar destino 1
En parada  (Pausa · siguiente: Destino 2)
   ↓  Continuar destino 2 (sin checklist de inicio)
Destino 2 · En progreso
   ↓  Recepción → si hay más, finalizar destino; si es el último…
Finalizar viaje + hoja de entrega
   ↓
Completado
```

| Paso | Qué hace | Botón / estado típico |
| --- | --- | --- |
| 1 | Abre el viaje e inicia **una sola vez** | **Iniciar viaje** / **Iniciar destino 1** (+ checklist de inicio opcional **solo aquí**) |
| 2 | En la parada, marca recepción | **Recepción** (Sí/No; observaciones opcionales) |
| 3 | Si **no** es la última parada, cierra solo esa | **Finalizar destino** → estado **en parada** |
| 4 | Arranca la siguiente **sin** checklist de inicio | **Continuar destino 2** (o 3…) |
| 5 | En la **última** parada, cierra todo el viaje | **Finalizar viaje** + **hoja de entrega** |

> **Importante:** el **checklist de inicio** solo se pide al arrancar el viaje (Destino 1). Al **Continuar destino 2, 3…** ya no se vuelve a pedir: lo lleva el mismo operador que inició.

#### Reglas que evitan confusiones

1. **No se salta** del Destino 1 al 3: siempre en orden.  
2. No use **Finalizar viaje** en una parada intermedia (use **Finalizar destino**).  
3. Sin **checklist de recepción** de la parada actual, no puede cerrar esa parada.  
4. La **hoja de entrega** se pide al cerrar el **viaje completo** (último destino), no en cada parada. En multidestino puede subir **varias** (las dos o más hojas de recepción).  
5. Carta porte y bitácora se pueden ver/subir en **Documentación** en cualquier momento del recorrido.

#### Ejemplo con 2 destinos (como en pantalla)

Orden: **1) Toyota Tsusho… → 2) Ciudad de México…**

1. Oficina crea el viaje multidestino y lo asigna.  
2. Operador inicia → trabaja **Destino 1** → recepción → **Finalizar destino 1**.  
3. Queda **en parada**; ve *Pausa · Siguiente acción: Destino 2 de 2*.  
4. Pulsa **Continuar destino 2** (sin checklist de inicio) → recepción en Destino 2.  
5. Como es el último: **Finalizar viaje** + hoja de entrega → **Completado**.

#### Cómo decirlo al capacitar

> *“Multidestino = varias entregas. Checklist de inicio solo al arrancar. Termina la 1, queda en parada, Continuar destino 2 sin checklist, y solo al último Finalizar viaje con la hoja de entrega.”*

---

### Guía del Operador (y Ayudante)

Esta sección explica **qué hace el personal de campo** en VOLTA. El administrador crea el viaje; el operador lo ejecuta.

#### Idea clave

> El operador **no crea viajes**. Solo ve **Mis viajes** (los que le asignaron como conductor) e inicia / avanza / finaliza el recorrido.  
> El **ayudante** ve los viajes donde va como **acompañante** (consulta y apoyo); el avance del viaje lo lleva el operador.  
> Procedimiento del acompañante: [Procedimiento para el acompañante (Ayudante)](#procedimiento-para-el-acompañante-ayudante).

#### Qué ve al iniciar sesión

Menú habitual del operador / ayudante:

| Menú | Uso |
| --- | --- |
| **Inicio** | Leer avisos / circulares de la flota (solo lectura). |
| **Viajes** | Solo **Mis viajes** (asignados a él). |
| **Perfil** | Actualizar nombre, teléfono y foto. |
| **Campana** | Notificaciones (viaje asignado, nuevo anuncio, etc.). |

No ve **Usuarios**, **Unidades**, **Gastos** ni **Facturas** (salvo que un administrador le asigne un permiso especial).

Cómo lo afecta el módulo **Usuarios** (alta, correo, contraseña y avisos): vea [Lado del operador y ayudante](#lado-del-operador-y-ayudante-módulo-usuarios) en la sección Usuarios.

Cómo visualiza los avisos en **Inicio**: vea [Lado del operador y ayudante (qué visualiza)](#lado-del-operador-y-ayudante-qué-visualiza).

#### Avisos en Inicio (operador)

1. Abra **Inicio** en el menú.  
2. Lea el listado: título, texto, autor, fecha e imagen (si hay).  
3. Los marcados **IMPORTANTE** aparecen primero.  
4. **No** puede crear ni borrar avisos.  
5. Si publican uno nuevo: llega *Nuevo anuncio* en la **campana**; al tocarla abre **Inicio**.

#### Cómo se entera de un viaje nuevo

1. El administrador crea el viaje y lo asigna como **Operador** (o **Acompañante**).  
2. Llega notificación (campana y, si está activo, correo).  
3. En **Viajes → Mis viajes** aparece el viaje en estado **Pendiente**.

#### Pantalla Mis viajes (qué ve el operador)

Al entrar a **Viajes**, el operador no ve el listado de oficina. Ve **Mis viajes** (*Solo tus viajes asignados como operador*).

> **Ayudante / acompañante:** la misma pantalla, pero el subtítulo dice *Viajes donde vas asignado como acompañante*. No tiene botones de iniciar ni finalizar. Vea [Procedimiento para el acompañante](#procedimiento-para-el-acompañante-ayudante).

**Barra superior**

| Elemento | Qué es |
| --- | --- |
| Menú (☰) | Abre el menú (Inicio, Viajes, Perfil…). |
| Título **Viajes** | Módulo actual. |
| **Campana** | Notificaciones. Si hay pendientes, muestra un número rojo (ej. **1**). |
| Avatar / iniciales | Acceso rápido a su perfil. |

**Encabezado del módulo**

- Título grande: **Mis viajes**.  
- Texto: *Solo tus viajes asignados como operador*.  
- Bloque **Historial de viajes** · *Tus viajes asignados*.  
- Pastilla negra **N activo(s)** (cuántos viajes tiene en curso / pendientes de atención).

**Tarjeta de un viaje**

Cada viaje se muestra en una tarjeta. Ejemplo de viaje **en progreso**:

| En la tarjeta | Significado |
| --- | --- |
| **EN CURSO** (+ **LIVE** si aplica) | Ya inició el recorrido; el viaje está activo. |
| Origen → Destino | Ruta del viaje (puntos verde / azul). |
| **Salida** / **Llegada estimada** | Fechas y horas programadas. |
| **Unidad** | Foto y número de unidad (ej. 003). |
| **Cliente** | Cliente del viaje. |
| **Acompañante** | Nombre o *Sin acompañante*. |
| **Asignado por** | Quién de la oficina asignó el viaje. |
| Botón **Continuar** | Abre el detalle para seguir (checklists, documentos, finalizar, etc.). |

**Cuándo se ve Multidestino en la tarjeta**

La pastilla **Multidestino · N destinos** (círculos 1 · 2… y etiqueta **DESTINO 1**) aparece solo si la oficina creó el viaje con **¿Multidestino? → Sí** y al menos un **Destino 2**.  
Si el viaje es de un solo destino, no se muestra esa pastilla (entrega única).

Otros estados que puede ver en la tarjeta (según el viaje):

| Estado en pantalla | Qué significa para el operador |
| --- | --- |
| **Pendiente** | Aún no lo inicia → suele verse **Iniciar viaje**. |
| **EN CURSO** / En progreso | Ya lo inició → **Continuar**. |
| **En parada** | Cerró un destino intermedio (multidestino); listo para el siguiente. |
| **Completado** | Ya cerró el viaje con su documentación. |

**Qué no ve en esta pantalla**

- Botón **Crear viaje**.  
- Editar / eliminar como administrador.  
- Exportar **Excel** global.  
- Filtro de semana de oficina (solo ve *sus* viajes).

**Cómo usarla (pasos cortos)**

1. Abra **Viajes** → pantalla **Mis viajes**.  
2. Revise la campana si hay número (viaje asignado, aviso, etc.).  
3. Localice el viaje (pendiente o **EN CURSO**).  
4. Pulse la tarjeta o **Continuar** / **Iniciar viaje**.  
5. En el detalle: documentos (**Carta porte**, **Bitácora** debajo de Tarjeta), checklists y acciones de avance.

Procedimiento completo: [Procedimiento para ejecutar un viaje (Operador)](#procedimiento-para-ejecutar-un-viaje-operador).

#### Detalle del viaje: Hoja de viaje y Datos del servicio

Al pulsar **Continuar** (o abrir el viaje), el operador ve la **hoja / detalle** del servicio. Es de **consulta** de lo que la oficina registró; aquí no edita origen, destino ni unidad.

##### Hoja de viaje

| Elemento | Qué significa |
| --- | --- |
| Título **Hoja de viaje** | Resumen del recorrido. |
| **Entrega única** (o multidestino) | Tipo de viaje: un solo destino o varios. |
| Estado (ej. **en progreso**) | Estado actual del viaje. |
| Origen → Destino | Ruta principal (ej. Volta Logistics → Toyota Tsusho…). |
| **INICIÓ** + fecha/hora | Momento real en que el operador pulsó **Iniciar viaje**. |

##### Itinerario de entregas

Lista de paradas. En un viaje de un destino suele haber una sola tarjeta marcada **Actual**:

| En la tarjeta del destino | Qué es |
| --- | --- |
| Etiqueta **Actual** | Destino en el que está trabajando ahora. |
| Dirección / lugar | Punto de entrega. |
| **SALIDA** / **LLEGADA** | Fecha y hora estimadas de ese tramo. |
| **DEF entregado** / **Playo** | Datos de carga que capturó la oficina (si aplican). |

En multidestino verá Destino 1, 2, 3… y solo uno lleva **Actual** a la vez.

##### Datos del servicio

| Campo | Qué muestra |
| --- | --- |
| **Operador** | Conductor asignado (usted). |
| **Acompañante** | Ayudante o *Sin acompañante*. |
| **Cliente** | Cliente del viaje. |
| **Asignado por** | Quién de la oficina creó/asignó el viaje. |
| **INICIÓ** (otra vez) | Confirmación de la hora de inicio real. |
| **Unidad** | Foto, número y placa del vehículo (ej. 003 · 99BK6M). |
| **Tarjeta** | Tarjeta de combustible/gastos, si viene registrada. |

Más abajo en el mismo detalle (según el rol):

- **Documentación** (Carta porte y Bitácora: **Ver** si ya las subió la oficina, o **Subir**).  
- Botones de acción: recepción, finalizar destino / **Finalizar viaje**, según el estado.  
- El bloque resumen **Checklists del operador** (inicio, recepción, hoja de entrega) lo ve solo el **administrador** en la hoja; el operador completa esos pasos con los botones de acción, no con ese resumen.

##### Cómo explicarlo en pocas palabras

> *“Continuar abre la hoja del viaje: ve la ruta, el destino actual, cuándo inició, operador, cliente, unidad y documentos. Ahí sigue con recepción o finalizar; no crea ni cambia los datos maestros del viaje.”*

#### Viaje de un solo destino (paso a paso)

Procedimiento completo numerado (mismo estilo que el del administrador):  
[Procedimiento para ejecutar un viaje (Operador)](#procedimiento-para-ejecutar-un-viaje-operador).

Resumen rápido:

1. Abra el viaje en **Mis viajes**.  
2. Pulse **Iniciar viaje**. El checklist de inicio es **opcional** (marcar Sí/No y observaciones; sin fotos).  
3. El viaje pasa a **En progreso**.  
4. En destino, complete el **checklist de recepción** si aplica.  
5. Pulse **Finalizar viaje** y adjunte la(s) **hoja(s) de entrega** (foto o PDF; en multidestino puede agregar varias).  
6. Suba la **bitácora de horas** cuando corresponda.  
7. El viaje queda **Completado** y se notifica a la administración.

#### Viaje multidestino (paso a paso)

Explicación completa y fácil de capacitar: [Cómo funciona el multidestino](#cómo-funciona-el-multidestino).

**Resumen para el operador**

1. Si la tarjeta dice **Multidestino · N destinos**, hay varias entregas.  
2. Al **iniciar** el viaje (Destino 1) puede llenar el checklist de inicio **una sola vez**.  
3. Destino 1: recepción → **Finalizar destino** (no “Finalizar viaje” aún).  
4. Queda **en parada**; pulse **Continuar destino 2** (**sin** checklist de inicio otra vez).  
5. Repita hasta el **último** destino.  
6. Solo al final: **Finalizar viaje** + **hoja(s) de entrega** (puede subir las de cada recepción).

Frase para capacitar:

> *“Checklist de inicio solo al arrancar. Después: recepción, Finalizar destino, Continuar destino siguiente, y al último Finalizar viaje.”*

#### Documentos que suele manejar el operador

| Documento | Cuándo |
| --- | --- |
| Carta porte | Oficina u operador (ver / subir) |
| Checklist de inicio | Al **Iniciar viaje** (opcional) |
| Checklist de recepción | En cada destino / parada |
| Hoja de entrega | Al **Finalizar viaje** (obligatoria al cerrar) |
| Bitácora de horas | Oficina u operador (durante o al cerrar) |

La **carta porte** puede adjuntarla la oficina al crear el viaje o el operador después.

#### Perfil y contraseña (operador / ayudante)

En **Perfil** puede:

- Editar nombre, apellidos, género y teléfono.  
- Cambiar o quitar su foto.  

**No** puede:

- Cambiar su correo (lo hace un administrador en **Usuarios**).  
- Cambiar contraseña desde Perfil (nadie: use recuperación en el login o **Usuarios → Editar**).  

Si olvidó la contraseña: en el login use **¿Olvidaste tu contraseña?** (código al correo), o pida a un administrador una nueva clave en **Usuarios → Editar**.

#### Cómo explicarlo en pocas palabras

> *“El operador abre Mis viajes, inicia el que le asignaron, completa checklists y documentos en cada parada, y al final finaliza el viaje con la hoja de entrega. Si hay varios destinos, avanza uno por uno. En Perfil solo actualiza sus datos y su foto; la contraseña la recupera desde el login.”*


### Estados del viaje

- **Pendiente:** registrado, aún sin iniciar.
- **En progreso:** el operador ya inició el recorrido (o un tramo concreto).
- **En parada:** aplica en viajes multidestino, entre destinos.
- **Completado:** viaje finalizado con su documentación.



### Exportación a Excel

1. Desde **Viajes**, pulse **Excel**.
2. Se generará el archivo `Reporte_Viajes_Completo_….xlsx` con el conjunto completo de viajes.
3. La columna **Semana** indica la semana correspondiente a cada registro.

> Nota: el selector de semana del listado no limita el contenido del Excel.

---



## 11. Módulo de Facturas

En este apartado se administran las facturas (PDF y/o XML) asociadas a cada viaje. El módulo aparece en el menú únicamente si el usuario cuenta con permiso de **ver** o **subir** facturas.

> Nota: estos permisos **no** se otorgan automáticamente solo por ser Administrador; deben asignarse de forma explícita desde el módulo **Usuarios**.



### Información / archivos admitidos

- Archivo PDF de la factura.
- Archivo XML (CFDI), cuando aplique.
- Ambos archivos pueden vincularse al mismo viaje.
- Tamaño máximo aproximado: **10 MB** por archivo.



### Pantalla del módulo

1. **Selecciona el viaje** — elija el viaje al que se asociarán las facturas (puede buscar por ruta, destino, cliente o estado).
2. **Facturas del viaje** — una vez seleccionado el viaje, se muestra el listado de facturas cargadas y las opciones de carga.



### Funciones según permiso


| Permiso           | Acciones                                          |
| ----------------- | ------------------------------------------------- |
| Ver facturas      | Consultar el listado y descargar PDF / XML.       |
| Subir facturas    | Adjuntar archivos PDF y/o XML al viaje.           |
| Eliminar facturas | Quitar una factura del viaje (pide confirmación). |




### Procedimiento para cargar una factura

1. Ingrese al menú **Facturas**.
2. En el paso 1, seleccione el viaje correspondiente.
3. En el paso 2, use la zona de carga (**Arrastra… / Subir archivo** en web, o el selector de archivos en móvil).
4. Seleccione el PDF y, si aplica, el XML.
5. Espere la confirmación de carga. La factura quedará listada con fecha y quien la subió.
6. Para descargar, use los iconos de descarga / XML en cada registro.
7. Para eliminar (si tiene permiso), pulse el icono de basura y confirme en el diálogo.



### Acceso restringido

Si el usuario no tiene permiso, verá el mensaje **Acceso restringido** e indicación de solicitar el permiso a un administrador.

---



## 12. Módulo Gastos

Visible para Administrador o quien tenga permiso de gastos.

### Conceptos habituales

- Comidas  
- DEF (precio unitario histórico por registro)  
- Caseta / TAG  
- Diésel  
- Otros gastos  
- Comprobante / factura opcional



### Acciones

- Registrar y editar gastos ligados a un viaje.
- Filtrar por semana en pantalla.
- Exportar Excel (conjunto completo según la lógica del módulo).

> Cambiar el precio de DEF en configuración **no** modifica gastos ya guardados; solo aplica a registros nuevos.

---



## 13. Módulo de Unidades

Alta, edición e inventarios de entrega de la flota. Visible para **Administrador** (o usuario con nivel administrativo equivalente). Quien no tenga acceso será redirigido al Dashboard.

### Pantalla del listado

Al entrar a **Unidades** verá **Unidades Registradas** (*Flota, capacidad y estado de cada vehículo*) con:

- Contador de unidades en la esquina del encabezado.
- Botón **+ Nueva Unidad**.
- Tarjetas por unidad (en web, dos columnas; en móvil, una): nombre, estado, modelo, placas, capacidad y cantidad de inventarios.
- En cada tarjeta: **Editar** y eliminar (icono de basura, con confirmación).
- Miniatura / foto de la unidad: pulse la imagen de la tarjeta para subir o cambiar la foto del vehículo.



### Estados de la unidad


| Estado            | Uso habitual                                                     |
| ----------------- | ---------------------------------------------------------------- |
| **Disponible**    | Lista para asignarse a un viaje.                                 |
| **Mantenimiento** | En taller o fuera de operación temporal.                         |
| **En ruta**       | En viaje activo (también se refleja con la operación de viajes). |
| **No disponible** | Fuera de servicio (otro motivo).                                 |




### Datos del formulario

En **Nueva unidad** / **Editar unidad**, bloque **Datos generales**:


| Campo         | Obligatorio | Notas                                                            |
| ------------- | ----------- | ---------------------------------------------------------------- |
| **Nombre**    | Sí          | Identificador de la unidad (p. ej. `002`, `007`).                |
| **Placas**    | Sí          | Placas del tracto.                                               |
| **Modelo**    | Sí          | Modelo o descripción del vehículo.                               |
| **Capacidad** | Sí          | Capacidad de carga (texto libre según su criterio).              |
| **Estado**    | Sí          | Una de las cuatro opciones anteriores (por defecto: Disponible). |


> **Remolque en viajes:** si el nombre de la unidad es **002** o **007**, al crear un viaje aparecerá el campo **Remolque** (Caja Seca / Lowboy) y la placa de remolque se asigna en ese flujo. El inventario y los datos generales de la unidad se gestionan aquí en **Unidades**.



### Procedimiento para dar de alta una unidad

1. Ingrese al menú **Unidades**.
2. Pulse **+ Nueva Unidad**. Se abre el modal **Nueva unidad** (*Registra la unidad; el inventario se agrega después de guardar*).
3. Complete **Nombre**, **Placas**, **Modelo** y **Capacidad**.
4. Elija el **Estado** (normalmente **Disponible** al dar de alta).
5. En la barra inferior pulse **Guardar**.
  - Si falta un campo obligatorio, el sistema pedirá completar los datos.  
  - **Cancelar** o la **X** cierran sin guardar.
6. La unidad aparece en el listado. El inventario **no** se captura en el alta: primero debe existir la unidad guardada.



### Procedimiento para editar o eliminar una unidad

1. En el listado, pulse **Editar** en la tarjeta de la unidad. Se abre **Editar unidad** (*Actualiza datos y registra inventarios de entrega*).
2. Modifique los datos generales y/o el estado.
3. Pulse **Guardar** para aplicar los cambios.
4. Para eliminar la unidad del sistema: en la tarjeta, pulse el icono de basura y confirme en el diálogo **Eliminar unidad**.



### Procedimiento para cambiar la foto de la unidad

1. En la tarjeta del listado, pulse la miniatura / imagen del vehículo.
2. Seleccione la foto desde el dispositivo o la cámara (según la plataforma).
3. Espere la confirmación **Imagen actualizada**. Si falla, reintente con otra imagen o menor resolución.



### Inventario de entrega

Cada inventario es un **registro histórico** (no se sobrescribe al crear otro). Sirve para documentar qué se entrega con la unidad al operador (herramientas, equipo, etc.), con firma digital.

Solo está disponible al **editar** una unidad ya guardada. En alta nueva verá el aviso: *Guarda la unidad primero. Después podrás crear inventarios de entrega.*

#### Qué puede incluir un inventario

- **Operador que recibe la unidad** (obligatorio).
- **Ítems** con cantidad y descripción (puede agregar varias filas con **Agregar ítem**), **o**
- **Foto de la hoja** manuscrita (opcional; en algunos casos basta la foto sin capturar ítem por ítem).
- **Firma digital** (obligatoria): el receptor firma en el panel; puede borrar y volver a firmar.

Debe haber **al menos** ítems con descripción **o** foto de la hoja, más operador y firma.

#### Procedimiento para registrar un inventario

1. Abra la unidad con **Editar**.
2. Baje a **Inventario de la unidad** → **Nuevo inventario de entrega**.
3. Seleccione el **Operador que recibe la unidad**.
4. Capture el contenido de una de estas formas (o ambas):
  - Filas de **Cantidad** + **Descripción**, y **Agregar ítem** si hace falta.  
  **Adjuntar foto de hoja** (opcional; use **Quitar foto** si se equivoca).
5. Capture la **Firma digital** en el área de firma.
6. Pulse **Guardar inventario**.
  - Si falta contenido, operador o firma, el sistema lo indicará.  
  - Si la imagen es demasiado grande, use otra foto o baje la calidad.
7. El registro queda en el historial con fecha, operador, contenido/firma y quién lo registró. Puede **Ver detalle** o **Eliminar** (con confirmación).



#### Comparación entre inventarios

Cuando existen al menos **dos** inventarios, el sistema compara el primero (entrega inicial) con el segundo registro y muestra diferencias: igual, cambio de cantidad, faltante o nuevo. En la tarjeta del listado, el contador de inventarios puede resaltar si hay diferencias.

### Relación con Viajes

- Al crear un viaje, el administrador elige la **Unidad** desde las registradas aquí.
- Unidades **002** y **007**: en el viaje aparece **Remolque** (Caja Seca / Lowboy).
- El estado **En ruta** refleja la unidad en operación; mantenga **Disponible** / **Mantenimiento** / **No disponible** según la realidad operativa cuando no esté en viaje.

---



## 14. Módulo de Usuarios

Gestión del personal para asignar a viajes y controlar accesos. Visible para **Administrador**.

> **Operador / Ayudante:** no ven el menú **Usuarios**. Su lado está en [Lado del operador y ayudante](#lado-del-operador-y-ayudante-módulo-usuarios) más abajo, y en la [Guía del Operador](#guía-del-operador-y-ayudante).

### Pantalla del listado

Al entrar a **Usuarios** verá **Catálogo de usuarios** (*Personal para asignar a viajes. El estado se cambia al editar.*) con:

- Contador de usuarios (en escritorio).
- Botón **Correos** (preferencias de aviso por correo).
- Botón **+ Agregar Usuario**.
- Listado agrupado por rol: **Administradores**, **Operadores**, **Ayudantes Generales** (y otros si aplica).
- En cada tarjeta: nombre, rol, estado **Activo** / **Inactivo**, teléfono o correo (si existen).
- Acciones: editar (lápiz) y eliminar (basura).

### Datos del formulario

En **Agregar Usuario** / **Editar Usuario**:

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| **Nombre(s)** | Sí | — |
| **Apellido paterno** | Sí | — |
| **Apellido materno** | No | — |
| **Género** | No | Mujer / Hombre / Sin especificar |
| **Rol** | Sí | Administrador, Operador o Ayudante |
| **Permisos** | No | Solo visible para el **desarrollador** (owners). Los demás administradores no ven esta sección. |
| **Estado** | Sí | Activo o Inactivo (por defecto Activo) |
| **Teléfono** | No | Contacto opcional |
| **Correo** | Condicional | Solo si el usuario iniciará sesión |
| **Contraseña** | Condicional | Alta: junto con el correo. Edición: *Nueva contraseña (opcional)* |

### Alta con acceso al sistema

Si el usuario debe entrar a VOLTA (web o app):

1. Capture **correo y contraseña juntos**.
2. La contraseña debe tener **mínimo 8 caracteres**, al menos **una mayúscula** y **un número**.
3. Si pone solo correo o solo contraseña, el sistema pedirá completar ambos.

### Alta solo para asignación a viajes

Puede crearse **sin correo ni contraseña**. Quedará en el catálogo para asignarlo como operador o acompañante, pero **no podrá iniciar sesión** hasta que un administrador le asigne correo y contraseña.

### Procedimiento para agregar un usuario

1. Ingrese al menú **Usuarios**.
2. Pulse **Agregar Usuario**. Se abre el modal (*Catálogo de personal. Correo y contraseña opcionales…*).
3. Complete **Nombre(s)** y **Apellido paterno**.
4. (Opcional) Apellido materno, género y teléfono.
5. Elija el **Rol** (Administrador, Operador o Ayudante).
6. (Solo desarrollador) Si aplica, abra **Permisos** → **Mostrar lista de permisos** y marque los adicionales (facturas, configuración, etc.). Los demás administradores no ven este bloque.
7. Deje el estado en **Activo** (o **Inactivo** si aún no debe usarse).
8. Si tendrá acceso al sistema: capture **Correo** y **Contraseña**. Si solo se asignará a viajes: déjelos vacíos.
9. Pulse **Guardar**. La **X** o **Cancelar** cierran sin guardar.
10. El usuario aparece en la sección de su rol.

### Procedimiento para editar un usuario

1. En la tarjeta, pulse el icono de lápiz. Se abre **Editar Usuario**.
2. Modifique datos, rol, estado, permisos o teléfono según necesite.
3. Para dar acceso a alguien que aún no tenía: agregue **correo** y, si hace falta, **Nueva contraseña (opcional)** (mín. 8 caracteres, mayúscula y número).
4. Pulse **Guardar**.  
   - Si no hubo cambios: el sistema lo indica.  
   - Si actualizó la contraseña: el usuario podrá iniciar sesión con la nueva.

### Procedimiento para activar o desactivar

1. Abra **Editar Usuario**.
2. En **Estado**, elija **Activo** o **Inactivo**.
3. Guarde. Un usuario **Inactivo** no debe usarse en la operación normal (el estado se ve en la tarjeta del listado).

> El estado **no** se cambia desde el listado: solo al editar.

### Procedimiento para eliminar un usuario

1. En la tarjeta, pulse el icono de basura.
2. Confirme en el diálogo **¿Eliminar usuario?** con **Eliminar** (o **Cancelar**).
3. La eliminación es permanente; si solo quiere quitar el acceso temporalmente, use **Inactivo**.

### Preferencias de correo (botón Correos)

1. En el listado, pulse **Correos**.
2. Se abre el panel *Elige quién recibe cada aviso por correo*.
3. Por usuario puede activar **Recibir correos** (requiere que el usuario tenga correo registrado).
4. Según el rol también aparecen interruptores de eventos, por ejemplo:  
   - Operadores / ayudantes: **Asignación**  
   - Administradores: **Inicio**, **Completado** (y los que muestre la pantalla)
5. Cada interruptor se guarda al cambiarlo. Si el usuario no tiene correo, edítelo primero y asígnele uno.

### Relación con Viajes y Perfil

- Los operadores y ayudantes del catálogo aparecen al crear un viaje.
- Cada persona puede actualizar su nombre, teléfono y foto en **Perfil**; el **rol**, **estado** y **permisos** solo se cambian aquí en **Usuarios**.
- Un administrador puede cambiar el correo de un usuario desde **Usuarios** o, en su propio perfil, desde **Mi Perfil**.

### Lado del operador y ayudante (módulo Usuarios)

El personal de campo **no administra** el catálogo. No aparece **Usuarios** en su menú. Lo que sí le afecta de este módulo es cómo la oficina lo da de alta y qué avisos recibe.

#### Qué no hace el operador aquí

| Acción | ¿Lo hace el operador? |
| --- | --- |
| Entrar a **Usuarios** | No |
| Crear / editar / eliminar personal | No |
| Cambiar roles, estado o permisos | No |
| Abrir el panel **Correos** | No (solo administración) |
| Cambiar su propio correo | No (pide a un admin en **Usuarios → Editar**) |

#### Cómo entra al sistema (lo prepara la oficina)

1. Un administrador lo da de alta en **Usuarios** con rol **Operador** o **Ayudante**.
2. Si debe iniciar sesión: le asignan **correo** y **contraseña** (mín. 8 caracteres, mayúscula y número).
3. Si solo lo van a poner en un viaje y aún no necesita acceso: puede existir **sin** correo; entonces **no podrá** entrar a VOLTA hasta que le den acceso.
4. El estado debe quedar **Activo**.

#### Qué ve y usa el operador (en lugar de Usuarios)

| En la app | Uso |
| --- | --- |
| **Inicio** | Lee avisos / circulares. |
| **Viajes → Mis viajes** | Solo los viajes donde va como conductor (operador) o acompañante (ayudante). |
| **Perfil** | Nombre, apellidos, género, teléfono y foto. |
| **Campana** | Notificaciones en la app (viaje asignado, acompañante, avisos nuevos, etc.). |

Detalle de pantallas: [Guía del Operador](#guía-del-operador-y-ayudante), [Módulo Perfil](#15-módulo-perfil) y [Notificaciones](#16-notificaciones).

#### Notificaciones que le llegan (lado operador)

| Aviso en la campana | Cuándo |
| --- | --- |
| **Viaje asignado** | La oficina lo pone como **operador** del viaje. |
| **Vas como acompañante** | Lo ponen como **acompañante**. |
| **Nuevo anuncio** | Publican un aviso en **Inicio**. |

No recibe en la campana los avisos de “viaje iniciado / finalizado” (esos van a **administradores**).

**Correo (opcional):** la oficina lo activa en **Usuarios → Correos** → interruptor **Asignación** (y **Recibir correos**). Si el correo está apagado, **igual** debe llegar el aviso en la **campana**.

#### Contraseña (operador / ayudante)

- Desde **Perfil** **no** se cambia la contraseña.
- Si la olvidó: en el login use **¿Olvidaste tu contraseña?** (código al correo registrado).
- Si no tiene correo o no le llega el código: pida a un administrador una nueva clave en **Usuarios → Editar**.

#### Resumen para capacitar al operador

> *“Usted no usa el módulo Usuarios. La oficina lo registra ahí. Usted entra con su correo, ve Mis viajes, la campana y su Perfil. Si olvida la contraseña, use recuperación en el login o pida apoyo a administración.”*

---

## 15. Módulo Perfil

Cada usuario actualiza **su propia** ficha (datos personales y foto). No sirve para administrar a otras personas: eso se hace en **Usuarios**. Visible para **todos** los roles (Administrador, Operador y Ayudante).

> **Usuarios** = la oficina administra al personal.  
> **Perfil** = cada quien cuida su propia ficha.

### Pantalla del perfil

Al entrar a **Perfil** verá **Mi Perfil** (*Actualiza tu información personal y foto*) con:

- Zona de **foto / avatar** (imagen o iniciales si no hay foto).
- Nombre completo debajo del avatar y pastilla del **rol** (solo lectura).
- Botones de foto:
  - **Galería** — elegir imagen del dispositivo.
  - **Cámara** — solo en app móvil.
  - **Eliminar** — quitar la foto guardada (si hay una).
  - **Descartar foto nueva** — si eligió una foto y aún no la guardó (aparece la marca **Nueva**).
- Formulario de datos personales:
  - **Nombre**
  - **Apellido paterno**
  - **Apellido materno**
  - **Género** (Mujer / Hombre)
  - **Email** (editable solo si es Administrador; si no, solo lectura)
  - **Contacto** (teléfono)
  - **Rol** (solo lectura)
- Botón **Guardar cambios**.

### Qué puede hacer cada rol

| Acción | Administrador | Operador / Ayudante |
| --- | --- | --- |
| Editar nombre, apellidos, género, teléfono | Sí | Sí |
| Cambiar o quitar foto | Sí | Sí |
| Cambiar correo | Sí | No (lo cambia un admin en Usuarios) |
| Cambiar contraseña en Perfil | No | No |
| Cambiar rol, estado o permisos | No desde aquí | No |

### Datos del formulario

| Campo | Editable | Notas |
| --- | --- | --- |
| **Nombre** | Sí | — |
| **Apellido paterno** | Sí | — |
| **Apellido materno** | Sí | — |
| **Género** | Sí | Mujer / Hombre |
| **Email** | Solo admin | Aviso en pantalla si el correo está bloqueado |
| **Contacto** | Sí | Teléfono |
| **Rol** | No | Solo lectura |

### Procedimiento para actualizar datos personales

1. Ingrese al menú **Perfil**.
2. Modifique nombre, apellidos, género y/o teléfono.
3. Si es administrador, también puede corregir el **Email**.
4. Pulse **Guardar cambios**. Sin guardar, no se aplican los cambios.
5. Debe ver la confirmación **Perfil actualizado correctamente**.

### Procedimiento para cambiar la foto

1. En la zona del avatar pulse **Galería** (o **Cámara** en móvil).
2. Aparecerá la marca **Nueva** y el aviso *Foto lista · pulsa Guardar para subirla*.
   - Si se equivocó: **Descartar foto nueva**.
3. Pulse **Guardar cambios** para subirla.
4. Para quitar la foto ya guardada: **Eliminar** y confirme.

Formatos: JPG o PNG.

### Contraseña

Desde **Perfil** ya no se cambia la contraseña. Opciones:

- Login: **¿Olvidaste tu contraseña?** (código al correo).
- Administrador: nueva clave en **Usuarios → Editar**.

### Restricciones

- Correo (si no es admin), rol, estado activo, permisos y contraseña **no** se cambian desde Perfil.
- El usuario **no** puede cambiarse a sí mismo el rol desde esta pantalla.

---


## 16. Notificaciones

Avisos dentro de la app (y, si aplica, en el teléfono o por correo) sobre viajes y circulares. Disponibles para **todos** los roles.

### Dónde están

- Icono de **campana** en la barra superior (web y móvil).
- Si hay pendientes, un **número** (badge) indica cuántas no leídas (máximo mostrado: **9+**).
- Al pulsar la campana se abre el panel **Notificaciones**.

### Cómo usar el panel

1. Pulse la **campana**.
2. Revise la lista (título, texto y fecha/hora).
3. Las **sin leer** se marcan visualmente (punto / fondo distinto).
4. Pulse una notificación:
   - Se marca como **leída**.
   - Si es de **viaje** → abre el módulo **Viajes**.
   - Si es de **anuncio** → abre **Inicio** (avisos).
5. Con pendientes, use **Marcar todas** para dejarlas leídas de golpe.
6. Cierre el panel con la **X** o tocando fuera.

Si no hay avisos: *Sin notificaciones*.

La lista se actualiza sola cada unos segundos (y al volver a la pestaña en web).

### Tipos de notificación (en la app)


| Título / tipo | Quién la recibe | Cuándo se genera |
| --- | --- | --- |
| **Viaje asignado** | Operador (conductor) | Al crear o asignar el viaje |
| **Vas como acompañante** | Ayudante / acompañante | Al asignarlo en el viaje |
| **Viaje iniciado** | Administradores | Cuando el operador inicia el viaje |
| **Viaje finalizado** | Administradores | Cuando el operador completa el viaje |
| **Nuevo anuncio** | Todos (menos quien publicó) | Al guardar un aviso en **Inicio** |


Cada ítem incluye un texto con ruta (origen → destino), quién asignó o el nombre del operador, según el caso.

### Notificaciones push (móvil)

- En la app móvil, si concede permisos, pueden llegar avisos en el dispositivo.
- Con la app abierta, también pueden mostrarse avisos locales al detectar notificaciones nuevas.
- En **web** no hay push del sistema: use la **campana**.

### Correo electrónico (aparte de la campana)

Los correos de viaje **no sustituyen** las notificaciones de la app: la campana sigue funcionando aunque el correo esté apagado.

Un administrador configura preferencias en **Usuarios → Correos**:

| Rol | Eventos de correo típicos |
| --- | --- |
| Operador / ayudante | **Asignación** de viaje |
| Administrador | **Inicio** y **Completado** (destino / llegada) |

Requisitos: usuario con **correo** registrado e interruptor **Recibir correos** (y el evento) activo. Detalle: [Preferencias de correo](#preferencias-de-correo-botón-correos).

### Resumen rápido

| Canal | Qué es |
| --- | --- |
| **Campana** | Lista en la app; siempre según eventos de viaje/avisos |
| **Push móvil** | Aviso en el teléfono (si hay permiso / build adecuado) |
| **Correo** | Opcional; se controla en **Usuarios → Correos** |

---



## 17. Configuración del sistema

Solo usuarios con permiso **system.config**.

Ajustes típicos:

- Precio unitario de DEF (solo registros nuevos).
- Activar / desactivar correos de eventos de viaje.
- Envío global de correos.
- Otros parámetros de sistema.

---



## 18. Problemas frecuentes


| Situación                             | Qué hacer                                                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| La web no muestra cambios recientes | Tras publicar con `npm run deploy:web`, la página se recarga sola en unos segundos. Si no, hard refresh una vez. |
| No veo Gastos / Unidades / Usuarios   | Faltan permisos; pedirlos a un administrador.                                                                                                |
| No veo Facturas o Configuración       | Esos módulos requieren permiso dedicado, aunque sea Administrador.                                                                           |
| Exportar Excel vs filtro de semana    | El filtro es solo visual; Exportar saca el reporte **global**.                                                                               |
| No llega el código de recuperación    | Revisar spam; usar **Reenviar código**; esperar ~1 minuto entre solicitudes.                                                                 |
| No veo un viaje como operador         | Solo aparecen viajes donde está asignado como conductor o acompañante.                                                                       |
| No hay ayudantes al asignar           | Debe existir al menos un usuario activo con rol **Ayudante**.                                                                                |
| En multidestino no puedo avanzar      | Complete el **checklist de recepción** del destino actual y use **finalizar destino/parada** (no “Finalizar viaje” si aún hay más destinos). |
| Dice “Sin más destinos”               | Ya está en el último tramo: use **Finalizar viaje** + hoja de entrega.                                                                       |
| No aparece Remolque                   | Solo se muestra en unidades que lo requieren (p. ej. 002, 007).                                                                              |
| Precio DEF distinto en un gasto viejo | Es normal: cada gasto guarda el precio de ese momento.                                                                                       |
| Fotos antiguas de checklist de inicio | Pueden depurarse automáticamente tras ~45 días.                                                                                              |


---



## Contacto de soporte

Para altas de usuario, permisos o fallas del sistema, contacte al administrador de VOLTA Logistics en su organización.

---

*Fin del manual de usuario · VOLTA Logistics v2.0*