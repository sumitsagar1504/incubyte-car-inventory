export type User={id:string;name:string;email:string;role:'USER'|'ADMIN';emailVerified:boolean};
export type Vehicle={id:string;make:string;model:string;category:string;price:string;quantity:number;year:number|null;mileage:number|null;fuelType:string|null;transmission:string|null;description:string|null;features:string[];images:string[];createdAt:string};
export type VehiclePage={items:Vehicle[];total:number;page:number;limit:number};
export type Reservation={id:string;status:'PENDING'|'CANCELLED';priceSnapshot:string;createdAt:string;vehicle:Vehicle};
export type AdminReservation=Reservation&{user:{id:string;name:string;email:string}};
