import type { User,Vehicle,VehiclePage } from './types';
const base=import.meta.env.VITE_API_BASE_URL || '';
export class ApiError extends Error {constructor(public status:number,message:string){super(message);}}
export async function api<T>(path:string, options:RequestInit={}):Promise<T>{
  const token=localStorage.getItem('token');
  const response=await fetch(`${base}/api${path}`,{...options,headers:{'Content-Type':'application/json',...(token&&{Authorization:`Bearer ${token}`}),...options.headers}});
  if(!response.ok){
    const body=await response.json().catch(()=>({error:{message:'Request failed'}}));
    if(response.status===401 && !path.startsWith('/auth/')){localStorage.removeItem('token');localStorage.removeItem('user');window.dispatchEvent(new Event('auth-expired'));}
    throw new ApiError(response.status,body.error?.message||'Request failed');
  }
  return response.status===204?undefined as T:response.json();
}
export const authApi={register:(data:{name:string;email:string;password:string})=>api<{user:User}>('/auth/register',{method:'POST',body:JSON.stringify(data)}),login:(data:{email:string;password:string})=>api<{token:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify(data)})};
export const vehicleApi={list:(params:URLSearchParams)=>api<VehiclePage>(`/vehicles/search?${params}`),create:(data:object)=>api<Vehicle>('/vehicles',{method:'POST',body:JSON.stringify(data)}),update:(id:string,data:object)=>api<Vehicle>(`/vehicles/${id}`,{method:'PUT',body:JSON.stringify(data)}),remove:(id:string)=>api<void>(`/vehicles/${id}`,{method:'DELETE'}),purchase:(id:string,quantity=1)=>api<Vehicle>(`/vehicles/${id}/purchase`,{method:'POST',body:JSON.stringify({quantity})}),restock:(id:string,quantity:number)=>api<Vehicle>(`/vehicles/${id}/restock`,{method:'POST',body:JSON.stringify({quantity})})};
