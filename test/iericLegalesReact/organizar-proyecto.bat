@echo off
echo ========================================
echo   ORGANIZANDO PROYECTO IERIC LEGALES
echo ========================================
echo.

echo [1/5] Creando estructura de carpetas...
if not exist "C:\Users\gonzalezy\Downloads\Test\YakiTest\test" mkdir "C:\Users\gonzalezy\Downloads\Test\YakiTest\test"
if not exist "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact" mkdir "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact"

echo [2/5] Copiando archivos del proyecto React...
xcopy "C:\Users\gonzalezy\Downloads\iericLegalesReact-main\iericLegalesReact-main\tanstack-table-app\*" "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\" /E /I /Y

echo [3/5] Creando README específico para el proyecto...
echo # IERIC Legales React - Proyecto Mejorado > "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo. >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo Este proyecto contiene las mejoras implementadas en la Etapa 1: >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo - Correcciones críticas en useSeleccionarFila >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo - Manejo de errores robusto >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo - Estados de carga y error >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo - Tipos TypeScript corregidos >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo - Optimización de rendimiento >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo. >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"
echo Ver ETAPA1-MEJORAS.md para detalles completos. >> "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\README.md"

echo [4/5] Verificando estructura...
if exist "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\src\hooks\SeleccionarFila.tsx" (
    echo ✅ SeleccionarFila.tsx copiado correctamente
) else (
    echo ❌ Error: SeleccionarFila.tsx no encontrado
)

if exist "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\src\utils\types.tsx" (
    echo ✅ types.tsx copiado correctamente
) else (
    echo ❌ Error: types.tsx no encontrado
)

if exist "C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\ETAPA1-MEJORAS.md" (
    echo ✅ ETAPA1-MEJORAS.md copiado correctamente
) else (
    echo ❌ Error: ETAPA1-MEJORAS.md no encontrado
)

echo.
echo [5/5] ¡Proyecto organizado exitosamente!
echo.
echo 📁 Ubicación: C:\Users\gonzalezy\Downloads\Test\YakiTest\test\iericLegalesReact\
echo.
echo Próximos pasos:
echo 1. Navegar a: cd "C:\Users\gonzalezy\Downloads\Test\YakiTest"
echo 2. Inicializar Git: git init
echo 3. Agregar archivos: git add .
echo 4. Crear commit: git commit -m "feat: Agregar proyecto React con Etapa 1"
echo 5. Crear rama: git checkout -b etapa-1-correcciones-criticas
echo 6. Conectar remoto: git remote add origin https://github.com/rmansillaIeric/YakiTest.git
echo 7. Subir: git push -u origin etapa-1-correcciones-criticas
echo.
pause
