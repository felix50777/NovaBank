@echo off
echo Iniciando NovaBank...

REM Inicia el backend Flask
start cmd /k "cd backend && ..\venv\Scripts\activate && flask run"

REM Inicia el frontend React
start cmd /k "cd frontend && npm start"

echo Todo listo! Backend y frontend iniciados.
