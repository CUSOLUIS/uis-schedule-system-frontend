#!/bin/bash
# filepath: /home/tafurc/Proyectos u/Cusol/SistemaDeHorarios/uis-schedule-system-frontend/start-dev.sh

# UIS Schedule System Frontend
# Script de inicio para desarrollo

set -x
exec docker compose -f docker-compose.yml up -d dev
