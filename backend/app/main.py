from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import contratos
from app.routers import pcfp
from app.routers import modelos
from app.routers import auth


def create_app() -> FastAPI:

    app = FastAPI(
        title="Repactuação API",
        description="API para gestão de contratos e repactuação",
        version="1.0.0"
    )

    # ===============================
    # CORS
    # ===============================

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # em produção ideal limitar
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ===============================
    # ROTAS
    # ===============================

    app.include_router(auth.router, prefix="/auth", tags=["Auth"])

    app.include_router(contratos.router)
    app.include_router(pcfp.router)
    app.include_router(modelos.router)

    # ===============================
    # ROTA DE HEALTHCHECK
    # ===============================

    @app.get("/", tags=["Health"])
    def healthcheck():
        return {"status": "API Repactuação online"}

    return app


app = create_app()