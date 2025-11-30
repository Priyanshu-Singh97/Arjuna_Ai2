# backend/main.py

from fastapi import FastAPI
from . import routes  # your routes module, if you have one

app = FastAPI(title="Arjuna AI Backend")

# Include routers if you have any
# app.include_router(routes.router)
