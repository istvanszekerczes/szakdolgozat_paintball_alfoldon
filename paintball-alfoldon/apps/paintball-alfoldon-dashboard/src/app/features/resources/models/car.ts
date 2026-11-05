/** Cars that take the equipment and the staff to the venues (see CarController.java). */
export interface Car {
  id: number;
  plate: string;
  seats: number;
  active: boolean;
}

export type CarInput = Omit<Car, 'id'>;
