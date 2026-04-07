from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)
from app.core.middleware import log_requests
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.routers import (
    contratos,
    pcfp,
    modelos,
    cargos,
    auth,
    permissions,
    usuarios,
    roles,
    auth_router,
    repactuacao
)


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
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.middleware("http")(log_requests)

    # ===============================
    # ROTAS
    # ===============================
    app.include_router(auth.router, prefix="/auth", tags=["Auth"])

    app.include_router(contratos.router, prefix="/contratos", tags=["Contratos"])
    app.include_router(pcfp.router, prefix="/pcfp", tags=["PCFP"])
    app.include_router(repactuacao.router, prefix="/repactuacoes", tags=["Repactuações"])
    app.include_router(modelos.router, prefix="/modelos", tags=["Modelos"])
    app.include_router(cargos.router, prefix="/cargos", tags=["Cargos"])
    app.include_router(roles.router, prefix="/roles", tags=["Roles"])
    app.include_router(permissions.router, prefix="/permissions", tags=["Permissions"])
    app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuários"])
    app.include_router(auth_router.router)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
    # ===============================
    # HEALTHCHECK
    # ===============================
    @app.get("/", tags=["Health"])
    def healthcheck():
        return {"status": "API Repactuação online"}

    

    return app


app = create_app()