#!/bin/bash

# SCRIPT DE RESPALDO TOTAL - CONECTAR RRHH
# Este script comprime ABSOLUTAMENTE CADA ARCHIVO Y CARPETA en la raíz sin excepciones.

echo "📦 Iniciando empaquetado TOTAL del sistema para Antigravity..."

# Nombre del archivo de salida
FILENAME="CONECTAR_FULL_BACKUP.zip"

# Limpieza de residuos anteriores
rm -f "$FILENAME"

# Compresión de TODO el contenido de la raíz
# Incluye carpetas 'c:', 'studio', 'workspace', 'src', etc.
# Solo excluimos temporales pesados que se regeneran (node_modules, .next)
zip -r "$FILENAME" . -x "node_modules/*" ".next/*" ".git/*"

echo ""
echo "-------------------------------------------------------"
echo "✅ RESPALDO GENERADO EXITOSAMENTE: $FILENAME"
echo "📍 UBICACIÓN: Carpeta raíz del proyecto"
echo "-------------------------------------------------------"
echo "👉 INSTRUCCIONES PARA DESCARGAR:"
echo "   1. Busca el archivo '$FILENAME' en el explorador de la izquierda."
echo "   2. Haz clic derecho sobre él."
echo "   3. Selecciona 'Download' (Descargar)."
echo "-------------------------------------------------------"
