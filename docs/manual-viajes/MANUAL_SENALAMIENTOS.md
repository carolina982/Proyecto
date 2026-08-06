# Manual del Módulo de Viajes — Señalamientos

**VOLTA Logistics** · Guía ilustrada  
**Versión:** 1.2 · agosto 2026

---

## Cómo marcar las capturas

En cada imagen dibuje círculos o números **① ② ③…** sobre el elemento.  
Debajo de la imagen, la tabla explica cada número.

| Quién | Qué puede hacer |
| --- | --- |
| **Administrador** | Crear, editar, eliminar, filtrar por semana y exportar Excel. |
| **Operador** | Iniciar/finalizar sus viajes; checklists, bitácora, hoja de entrega. |
| **Ayudante** | Consultar viajes donde va como acompañante. |

---

## Captura 1 — Pantalla principal (`01-listado.png`)

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | Título **Viajes** | Módulo activo. |
| **②** | Botón **+ Crear viaje** | Abre **Nuevo Viaje**. |
| **③** | Selector **Semana** | Filtro solo visual (no limita el Excel). |
| **④** | Botón **Excel** | Exporta **todos** los viajes. |

---

## Captura 2 — Información general (`02-nuevo-viaje-info.png`)

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | Encabezado **Nuevo Viaje** + **X** | Título y cierre. |
| **②** | Campo **Origen** | Punto de salida. |
| **③** | Campo **Destino** | Destino principal (= Destino 1). |
| **④** | **Cliente** | Desplegable; al final **Agregar**. |
| **⑤** | **Unidad** | Tracto asignado. |
| **⑥** | **Remolque** *(si se ve)* | Caja Seca / Lowboy; placa automática. |
| **⑦** | **Operador** | Conductor. |
| **⑧** | **Acompañante** | Ayudante o *Sin acompañante*. |

---

## Captura 3 — Carga y documentación (`03-documentacion-checklists.png`)

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | **DEF entregado** / **Playo** | Cantidades de carga. |
| **②** | **Carta porte** | Documento de oficina. |
| **③** | **Bitácora de horas** | La sube el operador. |
| **④** | Checklist de inicio / recepción | Seguimiento del operador. |
| **⑤** | **Hoja de entrega** | Al finalizar el viaje. |

---

## Captura 4 — Tarjeta (`04-tarjeta.png`)

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | **Seleccionar tarjeta** | Tarjeta de combustible/gastos. |
| **②** | Opción **Agregar** *(dentro del listado)* | Alta de tarjeta nueva (igual que Cliente). |

---

## Captura 5 — Fechas y tiempo Destino 1 (`05-fechas-destino1.png`)

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | Título **Fechas y tiempo** | Bloque A → B del Destino 1. |
| **②** | **Salida (A)** — Fecha y Hora | Salida del viaje. |
| **③** | **Llegada estimada (B)** | *Mismo día* / *Varios días* + hora. |
| **④** | **Tiempo estimado** | Se calcula al completar salida y llegada. |
| **⑤** | **¿Multidestino?** | **Sí** / **No**. |

---

## Captura 6 — Activar multidestino (`06-multidestino.png`)

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | **¿Multidestino? → Sí** | Activa destinos siguientes. |
| **②** | Nota de orden | Destino 1 → 2 → 3… |
| **③** | Título **Destinos siguientes (en orden)** | Bloque donde se agregan paradas. |
| **④** | Encabezado **Destino 2** | Primera parada extra. |

---

## Captura 7 — Destino 2 completo (`07-destino-2.png`) ⭐

Orden de los señalamientos = **orden de captura en pantalla** (de arriba abajo):

| # | Dónde marcarlo en la imagen | Explicación |
| --- | --- | --- |
| **①** | Título **Destino 2** (y papelera si hay) | Identifica la parada extra. |
| **②** | **Lugar del Destino 2** (*Buscar destino…*) | **Primero** el lugar de la parada. |
| **③** | Bloque **Fechas y tiempo** (título) | Mismo diseño que Destino 1. |
| **④** | **Salida (A)** | Fecha y hora de salida del tramo. |
| **⑤** | **Llegada estimada (B)** | Mismo día / varios días + hora. |
| **⑥** | **Tiempo estimado** | Duración calculada del tramo. |
| **⑦** | **Unidad** (*Automática*) | Hereda la del Destino 1. |
| **⑧** | **Operador** / **Acompañante** | Asignación del tramo. |
| **⑨** | **+ Agregar otro destino** | Suma Destino 3, 4… |
| **⑩** | **Cancelar** / **Guardar** | Pie del formulario. |

```
┌─────────────────────────────────────┐
│ Destino 2                        ①  │
│                                     │
│ LUGAR DEL DESTINO 2              ②  │
│ [ B  Buscar destino…        🔍 ]    │
│                                     │
│ FECHAS Y TIEMPO                  ③  │
│ ┌─ A SALIDA ──────────────────┐  ④  │
│ │ Fecha · Hora                │     │
│ └─────────────────────────────┘     │
│            ↕ ruta                   │
│ ┌─ B LLEGADA ESTIMADA ────────┐  ⑤  │
│ │ Mismo día / Varios días     │     │
│ └─────────────────────────────┘     │
│ Tiempo estimado                  ⑥  │
│                                     │
│ Unidad (Automática)              ⑦  │
│ Operador · Acompañante           ⑧  │
│                                     │
│ [ + Agregar otro destino ]       ⑨  │
└─────────────────────────────────────┘
        [ Cancelar ]  [ Guardar ]  ⑩
```

---

## Captura 8 — Flujo operador multidestino (`08-operador-flujo.png`) *(opcional)*

Si captura la hoja del viaje en curso:

| # | Dónde marcarlo | Texto del manual |
| --- | --- | --- |
| **①** | Estado (**En progreso** / **En parada**) | Fase del viaje. |
| **②** | Etiqueta **Destino X de Y** | Tramo actual. |
| **③** | Botón **Iniciar viaje** / siguiente tramo | Arranque del tramo. |
| **④** | Finalizar destino / parada | Cierra parada intermedia. |
| **⑤** | **Finalizar viaje** + hoja de entrega | Solo en el **último** destino. |

---

## Resumen rápido para quien dibuja los números

1. **Listado:** ① título ② crear ③ semana ④ Excel  
2. **Info general:** ① header ② origen ③ destino ④ cliente ⑤ unidad ⑥ remolque ⑦ operador ⑧ acompañante  
3. **Docs:** ① DEF/Playo ② carta porte ③ bitácora ④ checklists ⑤ hoja entrega  
4. **Tarjeta:** ① selector ② Agregar (dentro de la lista)  
5. **Fechas Destino 1:** ① bloque ② Salida ③ Llegada ④ Tiempo estimado ⑤ Multidestino  
6. **Multidestino ON:** ① Sí ② nota ③ sección ④ Destino 2  
7. **Destino 2:** ① título ② **lugar** ③ fechas ④ salida ⑤ llegada ⑥ estimado ⑦ unidad ⑧ asignación ⑨ agregar ⑩ guardar  

---

*Cuando tenga las capturas nuevas, guárdelas en esta carpeta con los nombres `01-…` a `08-…` y marque los números según las tablas.*
