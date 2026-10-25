import {useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {reservationApi,vehicleApi} from '../api';
import {Header,Footer,VehiclePhoto} from '../components/Chrome';
import {money} from '../media';
import type {Reservation,Vehicle} from '../types';

export function ReservationReview(){
  const {id}=useParams();
  const navigate=useNavigate();
  const [vehicle,setVehicle]=useState<Vehicle|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;if(id)vehicleApi.get(id).then(item=>{if(active)setVehicle(item)}).catch(cause=>{if(active)setError((cause as Error).message)});return()=>{active=false}},[id]);
  async function reserve(){if(!vehicle||busy)return;setBusy(true);setError('');try{const reservation=await reservationApi.create(vehicle.id);navigate(`/reservations/${reservation.id}`)}catch(cause){setError((cause as Error).message);setBusy(false)}}
  return <><Header/><main className="container narrow-page"><Link className="back-link" to={vehicle?`/vehicles/${vehicle.id}`:'/'}>← Back to vehicle</Link><p className="eyebrow">REVIEW YOUR REQUEST</p><h1>Reserve this vehicle</h1>{error&&<p className="notice error" role="alert">{error} {error.includes('Verify')&&<Link to="/account">Verify your email</Link>}</p>}{!vehicle&&!error?<p className="state">Loading vehicle…</p>:vehicle&&<div className="review-card"><VehiclePhoto vehicle={vehicle}/><div><h2>{vehicle.make} {vehicle.model}</h2><p>{vehicle.category} · {vehicle.quantity} available</p><strong>{money(vehicle.price)}</strong></div><div className="review-terms"><h3>What happens next</h3><p>Confirming holds one unit in inventory and creates a reservation in your account. No payment is taken. The dealership must confirm the vehicle details and next steps with you.</p><button className="btn primary full" disabled={busy||vehicle.quantity===0} onClick={reserve}>{busy?'Reserving…':vehicle.quantity===0?'Out of stock':'Confirm reservation'}</button></div></div>}</main><Footer/></>;
}

export function ReservationDetail(){
  const {id}=useParams();
  const [reservation,setReservation]=useState<Reservation|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;if(id)reservationApi.get(id).then(item=>{if(active)setReservation(item)}).catch(cause=>{if(active)setError((cause as Error).message)});return()=>{active=false}},[id]);
  async function cancel(){if(!reservation||busy||!window.confirm('Cancel this reservation and return the vehicle to inventory?'))return;setBusy(true);try{setReservation(await reservationApi.cancel(reservation.id))}catch(cause){setError((cause as Error).message)}finally{setBusy(false)}}
  return <><Header/><main className="container narrow-page"><Link className="back-link" to="/reservations">← My reservations</Link>{error&&<p className="notice error" role="alert">{error}</p>}{!reservation&&!error?<p className="state">Loading reservation…</p>:reservation&&<><p className="eyebrow">RESERVATION {reservation.status}</p><h1>{reservation.status==='PENDING'?'Your vehicle is held':'Reservation cancelled'}</h1><div className="confirmation-card"><h2>{reservation.vehicle.make} {reservation.vehicle.model}</h2><p>Reference: <strong>{reservation.id}</strong></p><p>Requested: {new Date(reservation.createdAt).toLocaleString()}</p><p>Listed price at request: {money(reservation.priceSnapshot)}</p><p>{reservation.status==='PENDING'?'No payment has been taken. The dealership will contact you about next steps.':'The held unit has been returned to inventory.'}</p>{reservation.status==='PENDING'&&<button className="btn outline" disabled={busy} onClick={cancel}>{busy?'Cancelling…':'Cancel reservation'}</button>}</div></>}</main><Footer/></>;
}

export function ReservationsList(){
  const [items,setItems]=useState<Reservation[]|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{reservationApi.list().then(result=>setItems(result.items)).catch(cause=>setError((cause as Error).message))},[]);
  return <><Header/><main className="container simple-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>My reservations</h1>{error&&<p className="notice error" role="alert">{error}</p>}{!items&&!error?<p className="state">Loading reservations…</p>:items?.length===0?<p className="state">You have no reservations yet. <Link to="/">Browse vehicles</Link></p>:<div className="saved-grid">{items?.map(item=><article className="saved-card" key={item.id}><VehiclePhoto vehicle={item.vehicle}/><div><h2>{item.vehicle.make} {item.vehicle.model}</h2><p>{item.status==='PENDING'?'Vehicle held':'Cancelled'} · {new Date(item.createdAt).toLocaleDateString()}</p><Link className="btn outline" to={`/reservations/${item.id}`}>View reservation</Link></div></article>)}</div>}</main><Footer/></>;
}
