import { Injectable } from '@angular/core';

export type Direction = { id: number; nom: string };
export type Service = { id: number; nom: string; directionId: number };
export type Employee = {
  id: number;
  nom: string;
  prenom: string;
  fonction: string;
  serviceId: number;
  email?: string;
  telephone?: string;
};

@Injectable({ providedIn: 'root' })
export class DirectoryMockService {
  private readonly directionsKey = 'sonabhy_directions';
  private readonly servicesKey = 'sonabhy_services';
  private readonly employeesKey = 'sonabhy_employees';

  private directions: Direction[] = [];

  private services: Service[] = [];

  private employees: Employee[] = [];

  constructor() {
    this.loadFromStorage();
  }

  getDirections(): Direction[] {
    return this.directions;
  }

  getServices(directionId?: number): Service[] {
    return directionId ? this.services.filter(s => s.directionId === directionId) : this.services;
  }

  getEmployees(): Employee[] {
    return this.employees;
  }

  findDirectionName(directionId: number): string | undefined {
    return this.directions.find(d => d.id === directionId)?.nom;
  }

  findServiceName(serviceId: number): string | undefined {
    return this.services.find(s => s.id === serviceId)?.nom;
  }

  addDirection(nom: string): Direction {
    const id = Math.max(0, ...this.directions.map(d => d.id)) + 1;
    const d = { id, nom } as Direction;
    this.directions.push(d);
    this.persist();
    return d;
  }

  addService(directionId: number, nom: string): Service {
    const id = Math.max(0, ...this.services.map(s => s.id)) + 1;
    const s = { id, nom, directionId } as Service;
    this.services.push(s);
    this.persist();
    return s;
  }

  addEmployee(e: Omit<Employee, 'id'>): Employee {
    const id = Math.max(0, ...this.employees.map(x => x.id)) + 1;
    const emp = { id, ...e } as Employee;
    this.employees.push(emp);
    this.persist();
    return emp;
  }

  updateDirection(id: number, nom: string) {
    const d = this.directions.find(x => x.id === id);
    if (d) { d.nom = nom; this.persist(); }
  }

  updateService(id: number, patch: Partial<Pick<Service, 'nom' | 'directionId'>>) {
    const s = this.services.find(x => x.id === id);
    if (s) {
      if (patch.nom !== undefined) s.nom = patch.nom;
      if (patch.directionId !== undefined) s.directionId = patch.directionId;
      this.persist();
    }
  }

  updateEmployee(id: number, patch: Partial<Omit<Employee, 'id'>>) {
    const e = this.employees.find(x => x.id === id);
    if (e) {
      Object.assign(e, patch);
      this.persist();
    }
  }

  deleteDirection(id: number) {
    this.services = this.services.filter(s => s.directionId !== id);
    const serviceIds = new Set(this.services.map(s => s.id));
    this.employees = this.employees.filter(e => serviceIds.has(e.serviceId));
    this.directions = this.directions.filter(d => d.id !== id);
    this.persist();
  }

  deleteService(id: number) {
    this.employees = this.employees.filter(e => e.serviceId !== id);
    this.services = this.services.filter(s => s.id !== id);
    this.persist();
  }

  deleteEmployee(id: number) {
    this.employees = this.employees.filter(e => e.id !== id);
    this.persist();
  }

  private loadFromStorage() {
    try {
      const d = localStorage.getItem(this.directionsKey);
      const s = localStorage.getItem(this.servicesKey);
      const e = localStorage.getItem(this.employeesKey);
      if (d) this.directions = JSON.parse(d);
      if (s) this.services = JSON.parse(s);
      if (e) this.employees = JSON.parse(e);
    } catch {}
  }

  private persist() {
    localStorage.setItem(this.directionsKey, JSON.stringify(this.directions));
    localStorage.setItem(this.servicesKey, JSON.stringify(this.services));
    localStorage.setItem(this.employeesKey, JSON.stringify(this.employees));
  }

  // Remplace toutes les données (pour un enregistrement groupé depuis l'UI Admin)
  saveAll(data: { directions: Direction[]; services: Service[]; employees: Employee[] }) {
    this.directions = [...data.directions];
    this.services = [...data.services];
    this.employees = [...data.employees];
    this.persist();
  }
}


