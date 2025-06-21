#!/bin/bash
# filepath: /home/tafurc/Proyectos u/Cusol/SistemaDeHorarios/uis-schedule-system-frontend/start-prod.sh

# UIS Schedule System Frontend
# Script de inicio para producción

set -x
exec docker compose -f docker-compose.yml up -d frontend
