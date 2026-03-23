#!/bin/bash

# SCRIPT DE EXPORTACIÓN A GITHUB - VERSIÓN DE INGENIERÍA
# Maneja de forma inteligente orígenes de datos existentes para evitar errores.

URL_REPO="https://github.com/Esteban-Olmedo83/ConectAr-HR.git"

echo "🚀 Iniciando sincronización con GitHub..."

# Inicialización de repositorio si no existe
if [ ! -d ".git" ]; then
    git init
    git checkout -b main
fi

# Configuración de origen segura (Maneja el error de origen existente)
if git remote | grep -q "origin"; then
    echo "ℹ️ Actualizando URL de origen existente..."
    git remote set-url origin "$URL_REPO"
else
    echo "ℹ️ Configurando nuevo origen de datos..."
    git remote add origin "$URL_REPO"
fi

# Consolidación de archivos
git add .
git commit -m "Respaldo Total del Proyecto - Estructura Completa Unificada"

echo ""
echo "-------------------------------------------------------"
echo "✅ SISTEMA SINCRONIZADO LOCALMENTE"
echo "-------------------------------------------------------"
echo "Para finalizar la subida, ejecuta este comando en la terminal:"
echo ""
echo "git push -u origin main"
echo "-------------------------------------------------------"
