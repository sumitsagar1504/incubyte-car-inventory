import type { Vehicle } from './types';

const demoPhotos:Record<string,string[]>={
  'Porsche 911 Carrera':['/images/vehicles/porsche-911-carrera.jpg','/images/vehicles/porsche-911-carrera-angle.jpg'],
  'Mercedes-Benz E-Class':['/images/vehicles/mercedes-benz-e-class.jpg','/images/vehicles/mercedes-benz-e-class-front.jpg'],
  'Land Rover Defender 110':['/images/vehicles/land-rover-defender-110.jpg','/images/vehicles/land-rover-defender-110-rear.jpg'],
  'BMW i4':['/images/vehicles/bmw-i4.jpg','/images/vehicles/bmw-i4-rear.jpg'],
  'Audi Q8':['/images/vehicles/audi-q8.jpg','/images/vehicles/audi-q8-rear.jpg'],
  'Volvo XC90':['/images/vehicles/volvo-xc90.jpg','/images/vehicles/volvo-xc90-rear.jpg']
};
export function vehicleImages(vehicle:Pick<Vehicle,'make'|'model'|'images'>):string[]{
  return vehicle.images?.length?vehicle.images:demoPhotos[`${vehicle.make} ${vehicle.model}`]??[];
}
export function money(value:string|number){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value))}
