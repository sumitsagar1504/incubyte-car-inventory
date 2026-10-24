export type User={id:string;name:string;email:string;role:'USER'|'ADMIN'};
export type Vehicle={id:string;make:string;model:string;category:string;price:string;quantity:number;createdAt:string};
export type VehiclePage={items:Vehicle[];total:number;page:number;limit:number};
