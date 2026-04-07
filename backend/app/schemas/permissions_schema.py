from pydantic import BaseModel


class PermissionCreate(BaseModel):
    resource: str
    action: str


class PermissionResponse(BaseModel):
    id: str
    resource: str
    action: str