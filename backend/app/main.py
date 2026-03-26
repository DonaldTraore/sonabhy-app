from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
from .db import init_db, get_session
from .models import (
    DirectionTable, Direction, DirectionCreate, DirectionUpdate,
    ServiceTable, Service, ServiceCreate, ServiceUpdate,
    EmployeeTable, Employee, EmployeeCreate, EmployeeUpdate,
)

app = FastAPI(title="Sonabhy API")

# CORS for Angular dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200", "http://localhost:4201", "http://127.0.0.1:4201"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    seed()


def seed():
    from .db import engine
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    with SessionLocal() as session:
        # Seed only if empty
        if session.scalar(select(DirectionTable).limit(1)):
            return
        # Directions
        dsi = DirectionTable(nom="Direction des Systèmes Informatiques")
        drh = DirectionTable(nom="Direction des Ressources Humaines")
        dq = DirectionTable(nom="Direction Qualité")
        session.add_all([dsi, drh, dq])
        session.commit()
        session.refresh(dsi); session.refresh(drh); session.refresh(dq)
        # Services
        s_maint = ServiceTable(nom="Service Maintenance", direction_id=dsi.id)
        s_inf = ServiceTable(nom="Service Informatique", direction_id=dsi.id)
        s_rh = ServiceTable(nom="Service RH", direction_id=drh.id)
        s_qual = ServiceTable(nom="Service Qualité Humaines", direction_id=dq.id)
        session.add_all([s_maint, s_inf, s_rh, s_qual])
        session.commit()
        # Employees
        session.add_all([
            EmployeeTable(service_id=s_maint.id, prenom="Donald", nom="TRAORE", fonction="Chef-maintenancier", email="donald@gmail.com", telephone="+2267876543"),
            EmployeeTable(service_id=s_maint.id, prenom="Aubin", nom="COMPAORE", fonction="Adjoint-maintenancier", email="aubin@gmail.com", telephone="+227345267"),
            EmployeeTable(service_id=s_rh.id, prenom="Moussa", nom="KABORE", fonction="Agent-traitant"),
        ])
        session.commit()


# Directions CRUD
@app.get("/api/directions", response_model=list[Direction])
def list_directions(session: Session = Depends(get_session)):
    return session.scalars(select(DirectionTable)).all()

@app.post("/api/directions", response_model=Direction)
def create_direction(payload: DirectionCreate, session: Session = Depends(get_session)):
    d = DirectionTable(**payload.dict())
    session.add(d)
    session.commit()
    session.refresh(d)
    return Direction(id=d.id, nom=d.nom)

@app.patch("/api/directions/{dir_id}", response_model=Direction)
def update_direction(dir_id: int, payload: DirectionUpdate, session: Session = Depends(get_session)):
    d = session.get(DirectionTable, dir_id)
    if not d: 
        raise HTTPException(404, "Direction not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(d, k, v)
    session.add(d)
    session.commit()
    session.refresh(d)
    return Direction(id=d.id, nom=d.nom)

@app.delete("/api/directions/{dir_id}")
def delete_direction(dir_id: int, session: Session = Depends(get_session)):
    d = session.get(DirectionTable, dir_id)
    if not d:
        raise HTTPException(404, "Direction not found")
    # Cascade: delete employees of services in this direction, then services, then direction
    services = session.scalars(select(ServiceTable).where(ServiceTable.direction_id == dir_id)).all()
    for s in services:
        emps = session.scalars(select(EmployeeTable).where(EmployeeTable.service_id == s.id)).all()
        for e in emps:
            session.delete(e)
        session.delete(s)
    session.delete(d)
    session.commit()
    return {"ok": True}


# Services CRUD
@app.get("/api/services", response_model=list[Service])
def list_services(direction_id: int | None = None, session: Session = Depends(get_session)):
    query = select(ServiceTable)
    if direction_id is not None:
        query = query.where(ServiceTable.direction_id == direction_id)
    return session.scalars(query).all()

@app.post("/api/services", response_model=Service)
def create_service(payload: ServiceCreate, session: Session = Depends(get_session)):
    s = ServiceTable(**payload.dict())
    session.add(s)
    session.commit()
    session.refresh(s)
    return Service(id=s.id, nom=s.nom, direction_id=s.direction_id)

@app.patch("/api/services/{svc_id}", response_model=Service)
def update_service(svc_id: int, payload: ServiceUpdate, session: Session = Depends(get_session)):
    s = session.get(ServiceTable, svc_id)
    if not s: 
        raise HTTPException(404, "Service not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(s, k, v)
    session.add(s)
    session.commit()
    session.refresh(s)
    return Service(id=s.id, nom=s.nom, direction_id=s.direction_id)

@app.delete("/api/services/{svc_id}")
def delete_service(svc_id: int, session: Session = Depends(get_session)):
    s = session.get(ServiceTable, svc_id)
    if not s:
        raise HTTPException(404, "Service not found")
    # Cascade: delete employees in this service, then the service
    emps = session.scalars(select(EmployeeTable).where(EmployeeTable.service_id == s.id)).all()
    for e in emps:
        session.delete(e)
    session.delete(s)
    session.commit()
    return {"ok": True}


# Employees CRUD + search
@app.get("/api/employees", response_model=list[Employee])
def list_employees(q: str | None = None, direction_id: int | None = None, service_id: int | None = None, session: Session = Depends(get_session)):
    try:
        base = select(EmployeeTable)
        if service_id is not None:
            base = base.where(EmployeeTable.service_id == service_id)
        elif direction_id is not None:
            # join on Service to filter by direction
            base = select(EmployeeTable).join(ServiceTable).where(ServiceTable.direction_id == direction_id)
        employees = session.scalars(base).all()

        if q:
            import unicodedata
            def normalize(s: str | None) -> str:
                s = s or ""
                return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()
            nq = normalize(q)
            employees = [
                e for e in employees
                if any(
                    nq in normalize(v)
                    for v in [e.prenom, e.nom, e.fonction, e.email, e.telephone]
                )
            ]
        return employees
    except Exception as exc:
        print("/api/employees error:", exc)
        raise HTTPException(500, "Search failed")

@app.post("/api/employees", response_model=Employee)
def create_employee(payload: EmployeeCreate, session: Session = Depends(get_session)):
    e = EmployeeTable(**payload.dict())
    session.add(e)
    session.commit()
    session.refresh(e)
    return Employee(id=e.id, prenom=e.prenom, nom=e.nom, fonction=e.fonction, email=e.email, telephone=e.telephone, service_id=e.service_id)

@app.patch("/api/employees/{emp_id}", response_model=Employee)
def update_employee(emp_id: int, payload: EmployeeUpdate, session: Session = Depends(get_session)):
    e = session.get(EmployeeTable, emp_id)
    if not e: 
        raise HTTPException(404, "Employee not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(e, k, v)
    session.add(e)
    session.commit()
    session.refresh(e)
    return Employee(id=e.id, prenom=e.prenom, nom=e.nom, fonction=e.fonction, email=e.email, telephone=e.telephone, service_id=e.service_id)

@app.delete("/api/employees/{emp_id}")
def delete_employee(emp_id: int, session: Session = Depends(get_session)):
    e = session.get(EmployeeTable, emp_id)
    if not e: 
        raise HTTPException(404, "Employee not found")
    session.delete(e)
    session.commit()
    return {"ok": True}

