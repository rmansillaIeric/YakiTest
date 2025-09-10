# 📋 Instrucciones para Subir el Proyecto a YakiTest

## 🚀 Pasos para Organizar y Subir el Proyecto

### **1. Ejecutar el Script de Organización**
```bash
# Ejecutar el archivo organizar-proyecto.bat
# Esto creará la estructura: Test/YakiTest/test/iericLegalesReact/
```

### **2. Navegar al Repositorio YakiTest**
```bash
cd "C:\Users\gonzalezy\Downloads\Test\YakiTest"
```

### **3. Inicializar Git (si no está inicializado)**
```bash
git init
```

### **4. Agregar el Repositorio Remoto**
```bash
git remote add origin https://github.com/rmansillaIeric/YakiTest.git
```

### **5. Verificar la Conexión**
```bash
git remote -v
```

### **6. Agregar Todos los Archivos**
```bash
git add .
```

### **7. Crear Commit Inicial**
```bash
git commit -m "feat: Agregar proyecto React iericLegalesReact con Etapa 1 completada

- Proyecto React completo con mejoras de la Etapa 1
- Hook useSeleccionarFila refactorizado
- Tipos TypeScript corregidos
- Manejo de errores robusto implementado
- Estados de carga y error agregados
- Optimización de rendimiento con requests paralelos
- Documentación completa de mejoras"
```

### **8. Crear Rama para las Mejoras**
```bash
git checkout -b etapa-1-correcciones-criticas
```

### **9. Subir al Repositorio Remoto**
```bash
git push -u origin etapa-1-correcciones-criticas
```

### **10. Verificar en GitHub**
- Ir a: https://github.com/rmansillaIeric/YakiTest
- Verificar que aparezca la rama `etapa-1-correcciones-criticas`
- Verificar que esté la carpeta `test/iericLegalesReact/`

## 📁 Estructura Final del Repositorio

```
YakiTest/
├── test/
│   └── iericLegalesReact/          # ← Proyecto React mejorado
│       ├── src/
│       │   ├── hooks/
│       │   │   └── SeleccionarFila.tsx  # ← Hook mejorado
│       │   └── utils/
│       │       └── types.tsx       # ← Tipos corregidos
│       ├── ETAPA1-MEJORAS.md       # ← Documentación de mejoras
│       ├── README.md               # ← README del proyecto
│       ├── package.json
│       └── ... (resto del proyecto)
├── assets/                         # ← Recursos existentes
├── index.html                      # ← Página principal existente
└── README.md                       # ← Documentación principal
```

## 🔍 Verificación de Archivos Importantes

Después de ejecutar los pasos, verificar que existan:

- ✅ `test/iericLegalesReact/src/hooks/SeleccionarFila.tsx`
- ✅ `test/iericLegalesReact/src/utils/types.tsx`
- ✅ `test/iericLegalesReact/ETAPA1-MEJORAS.md`
- ✅ `test/iericLegalesReact/README.md`

## 🚨 Solución de Problemas

### **Si hay conflictos con el repositorio remoto:**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin etapa-1-correcciones-criticas
```

### **Si necesitas forzar el push:**
```bash
git push -u origin etapa-1-correcciones-criticas --force
```

### **Si quieres hacer merge a main:**
```bash
git checkout main
git merge etapa-1-correcciones-criticas
git push origin main
```

## 📝 Próximos Pasos

1. **Verificar** que todo se subió correctamente
2. **Crear Pull Request** en GitHub para revisar los cambios
3. **Continuar** con la Etapa 2: Optimización de Rendimiento
4. **Documentar** nuevas mejoras en futuras etapas

---

**Desarrollado por**: Equipo de Desarrollo IERIC  
**Fecha**: Enero 2025  
**Versión**: 1.0.0 - Etapa 1
