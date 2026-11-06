/** Staff and their absences (see EmployeeController.java). */
export type EmploymentType = 'FULL_TIME' | 'ON_CALL';

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Főállású',
  ON_CALL: 'Beugrós',
};

export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  employmentType: EmploymentType;
  active: boolean;
}

export type EmployeeInput = Omit<Employee, 'id'>;

export interface Exclusion {
  id: number;
  dateFrom: string;
  dateTo: string;
  reason: string | null;
}
