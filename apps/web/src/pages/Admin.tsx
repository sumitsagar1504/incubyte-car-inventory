import {useCallback,useEffect,useState,type FormEvent} from 'react';
import {ShieldCheck} from 'lucide-react';
import {vehicleApi,reservationApi} from '../api';
import {Header,Footer} from '../components/Chrome';
import {money} from '../media';
import type {Vehicle,AdminReservation} from '../types';

type Fields={make:string;model:string;category:string;price:string;quantity:string;year:string;mileage:string;fuelType:string;transmission:string;description:string;features:string};
const empty:Fields={make:'',model:'',category:'',price:'',quantity:'0',year:'',mileage:'',fuelType:'',transmission:'',description:'',features:''};
function fromVehicle(vehicle:Vehicle):Fields{return {make:vehicle.make,model:vehicle.model,category:vehicle.category,price:vehicle.price,quantity:String(vehicle.quantity),year:String(vehicle.year??''),mileage:String(vehicle.mileage??''),fuelType:vehicle.fuelType??'',transmission:vehicle.transmission??'',description:vehicle.description??'',features:vehicle.features?.join(', ')??''}}

export default function Admin(){
  const [vehicles,setVehicles]=useState<Vehicle[]>([]);
  const [loading,setLoading]=useState(true);
  const [reservations,setReservations]=useState<AdminReservation[]>([]);
  const [fields,setFields]=useState<Fields>(empty);
  const [editing,setEditing]=useState<string|null>(null);
  const [restocking,setRestocking]=useState<string|null>(null);
  const [restockQuantity,setRestockQuantity]=useState('1');
  const [search,setSearch]=useState('');
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const load=useCallback(async()=>{try{const [stock,requests]=await Promise.all([vehicleApi.list(new URLSearchParams({limit:'100'})),reservationApi.adminList()]);setVehicles(stock.items);setReservations(requests.items)}catch(cause){setError((cause as Error).message)}finally{setLoading(false)}},[]);
  useEffect(()=>{void load()},[load]);
  function set(key:keyof Fields,value:string){setFields(current=>({...current,[key]:value}))}
  function clearForm(){setEditing(null);setFields(empty)}
  async function submit(event:FormEvent){
    event.preventDefault();setError('');setMessage('');setBusy(true);
    const data={make:fields.make.trim(),model:fields.model.trim(),category:fields.category.trim(),price:Number(fields.price),quantity:Number(fields.quantity),year:fields.year?Number(fields.year):null,mileage:fields.mileage?Number(fields.mileage):null,fuelType:fields.fuelType.trim()||null,transmission:fields.transmission.trim()||null,description:fields.description.trim()||null,features:fields.features.split(',').map(value=>value.trim()).filter(Boolean)};
    try{if(editing)await vehicleApi.update(editing,data);else await vehicleApi.create(data);setMessage(editing?'Vehicle updated.':'Vehicle added.');clearForm();await load()}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }
  async function remove(vehicle:Vehicle){if(!window.confirm(`Delete ${vehicle.make} ${vehicle.model}?`))return;setError('');try{await vehicleApi.remove(vehicle.id);setMessage('Vehicle deleted.');await load()}catch(cause){setError((cause as Error).message)}}
  async function restock(vehicle:Vehicle){const quantity=Number(restockQuantity);if(!Number.isInteger(quantity)||quantity<1){setError('Enter a positive whole number.');return}setError('');try{await vehicleApi.restock(vehicle.id,quantity);setMessage('Stock updated.');setRestocking(null);setRestockQuantity('1');await load()}catch(cause){setError((cause as Error).message)}}
  const shown=vehicles.filter(vehicle=>`${vehicle.make} ${vehicle.model}`.toLowerCase().includes(search.toLowerCase()));
  return <><Header/><main className="container admin-page"><p className="eyebrow"><ShieldCheck size={16}/> ADMIN WORKSPACE</p><div className="section-heading"><div><h1>Inventory management</h1><p>Keep your collection current and ready for the road.</p></div><span className="admin-count">{loading?'Loading…':`${vehicles.length} vehicles`}</span></div>{message&&<p className="notice success" role="status">{message}</p>}{error&&<p className="notice error" role="alert">{error}</p>}
    <div className="admin-layout"><section className="admin-form"><h2>{editing?'Edit vehicle':'Add a vehicle'}</h2><p className="muted">Enter the details you know. Leave unconfirmed specifications blank.</p><form className="form-stack" onSubmit={submit}><label>Make<input value={fields.make} onChange={event=>set('make',event.target.value)} required maxLength={80}/></label><label>Model<input value={fields.model} onChange={event=>set('model',event.target.value)} required maxLength={80}/></label><label>Category<input value={fields.category} onChange={event=>set('category',event.target.value)} required maxLength={80}/></label><div className="form-pair"><label>Price (USD)<input type="number" min="0" step="0.01" value={fields.price} onChange={event=>set('price',event.target.value)} required/></label><label>Quantity<input type="number" min="0" step="1" value={fields.quantity} onChange={event=>set('quantity',event.target.value)} required/></label></div><div className="form-pair"><label>Year<input type="number" min="1900" max="2100" value={fields.year} onChange={event=>set('year',event.target.value)}/></label><label>Mileage (mi)<input type="number" min="0" step="1" value={fields.mileage} onChange={event=>set('mileage',event.target.value)}/></label></div><label>Fuel type<input value={fields.fuelType} onChange={event=>set('fuelType',event.target.value)} maxLength={80}/></label><label>Transmission<input value={fields.transmission} onChange={event=>set('transmission',event.target.value)} maxLength={80}/></label><label>Description<textarea value={fields.description} onChange={event=>set('description',event.target.value)} rows={4} maxLength={2000}/></label><label>Features, separated by commas<input value={fields.features} onChange={event=>set('features',event.target.value)}/></label><button className="btn primary full" disabled={busy}>{busy?'Saving…':editing?'Save changes':'Add vehicle'}</button>{editing&&<button type="button" className="btn text" onClick={clearForm}>Cancel editing</button>}</form></section>
    <section className="admin-list"><h2>Current collection</h2><label className="admin-search">Search inventory<input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Make or model"/></label>{shown.length===0&&<p className="state">{loading?'Loading inventory…':'No vehicles match.'}</p>}{shown.map(vehicle=><article className="admin-row" key={vehicle.id}><div><span className="row-category">{vehicle.category}</span><h3>{vehicle.make} {vehicle.model}</h3><p>{money(vehicle.price)} · {vehicle.quantity} in stock</p></div><div className="row-actions"><button onClick={()=>{setEditing(vehicle.id);setFields(fromVehicle(vehicle));window.scrollTo({top:0,behavior:'smooth'})}}>Edit</button><button onClick={()=>setRestocking(restocking===vehicle.id?null:vehicle.id)}>Restock</button><button className="danger" onClick={()=>remove(vehicle)}>Delete</button>{restocking===vehicle.id&&<form className="restock-inline" onSubmit={event=>{event.preventDefault();void restock(vehicle)}}><label>Quantity<input type="number" min="1" step="1" value={restockQuantity} onChange={event=>setRestockQuantity(event.target.value)}/></label><button>Apply</button></form>}</div></article>)}</section></div>
    <section className="admin-requests"><h2>Customer reservations</h2>{reservations.length===0?<p>{loading?'Loading reservations…':'No reservations yet.'}</p>:<div className="request-list">{reservations.map(item=><article key={item.id}><h3>{item.vehicle.make} {item.vehicle.model}</h3><p>{item.user.name} · <a href={`mailto:${item.user.email}`}>{item.user.email}</a></p><p>{item.status} · {new Date(item.createdAt).toLocaleString()} · {money(item.priceSnapshot)}</p><small>Reference {item.id}</small></article>)}</div>}</section>
  </main><Footer/></>;
}
