@echo off
title Atualizador GitHub - RPG Ficha
color 0A

echo ==========================================
echo      🚀 ATUALIZADOR AUTOMATICO GITHUB
echo ==========================================
echo.

:: Verificar se o git existe
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git nao encontrado! Instale o Git primeiro.
    pause
    exit /b
)

:: Mostrar status (opcional)
echo 📊 Verificando alteracoes...
git status
echo.

:: Perguntar mensagem
set /p msg=📝 Digite a mensagem do commit (ou ENTER para auto): 

if "%msg%"=="" (
    set msg=Atualizacao automatica
)

:: Adicionar arquivos
echo.
echo 📦 Adicionando arquivos...
git add .

:: Commit (não quebra se não tiver alteração)
echo.
echo 💾 Criando commit...
git commit -m "%msg%" 2>nul

:: Push
echo.
echo 🌐 Enviando para GitHub...
git push

:: Resultado
if %errorlevel%==0 (
    echo.
    echo ==========================================
    echo ✅ SUCESSO! Projeto atualizado!
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo ⚠️ Pode nao haver alteracoes ou ocorreu erro
    echo ==========================================
)

echo.
pause