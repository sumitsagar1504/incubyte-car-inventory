import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {CarFront,Heart,Scale} from 'lucide-react';
import {vehicleApi} from '../api';
import {useAuth} from '../auth';
import {Header,Footer} from '../components/Chrome';
import {money,vehicleImages} from '../media';
import {useSavedCars} from '../saved';
import type {Vehicle} from '../types';

export default function VehicleDetail(){
  const {id}=useParams();
  const {user}=useAuth();
  const {favorites,compare,toggleFavorite,toggleCompare}=useSavedCars();
  const [vehicle,setVehicle]=useState<Vehicle|null>(null);
  const [selected,setSelected]=useState(0);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  useEffect(()=>{let active=true;if(id)vehicleApi.get(id).then(item=>{if(active)setVehicle(item)}).catch(cause=>{if(active)setError((cause as Error).message)});return()=>{active=false}},[id]);
  const images=vehicle?vehicleImages(vehicle):[];
  function compareClick(){if(vehicle && !toggleCompare(vehicle.id))setMessage('Compare up to three vehicles at a time.');else setMessage('')}
  return <><Header/><main className="container detail-page"><Link to="/" className="back-link">← Back to collection</Link>{error?<p className="notice error" role="alert">{error}</p>:!vehicle?<p className="state">Loading vehicle details…</p>:<>
    <div className="detail-heading"><div><p className="eyebrow">{vehicle.category}</p><h1>{vehicle.make} {vehicle.model}</h1><p>{vehicle.quantity>0?`${vehicle.quantity} available`:'Currently out of stock'}</p></div><strong>{money(vehicle.price)}</strong></div>
    <div className="detail-layout"><section className="gallery" aria-label="Vehicle photos"><div className="gallery-main">{images.length?<img src={images[selected]??images[0]} alt={`${vehicle.make} ${vehicle.model}, view ${selected+1}`}/>:<div className="image-fallback"><CarFront size={80}/><span>Photo not available</span></div>}</div>{images.length>1&&<div className="gallery-thumbs">{images.map((source,index)=><button type="button" key={source} aria-label={`Show photo ${index+1}`} aria-pressed={selected===index} onClick={()=>setSelected(index)}><img src={source} alt=""/></button>)}</div>}<p className="photo-note">Model photos are illustrative. Confirm the exact vehicle details with the dealership. <a href="/photo-credits.html">Photo credits</a></p></section>
    <div className="detail-content"><section className="detail-panel"><h2>Vehicle details</h2><p>{vehicle.description||'Ask the dealership for the year, mileage, equipment and vehicle history.'}</p><dl className="spec-grid"><div><dt>Year</dt><dd>{vehicle.year??'Ask us'}</dd></div><div><dt>Mileage</dt><dd>{vehicle.mileage!=null?`${vehicle.mileage.toLocaleString()} mi`:'Ask us'}</dd></div><div><dt>Fuel type</dt><dd>{vehicle.fuelType||'Ask us'}</dd></div><div><dt>Transmission</dt><dd>{vehicle.transmission||'Ask us'}</dd></div></dl>{vehicle.features?.length>0&&<><h3>Features</h3><ul className="feature-list">{vehicle.features.map(feature=><li key={feature}>{feature}</li>)}</ul></>}</section>
    <section className="detail-panel action-panel"><h2>Interested in this vehicle?</h2><p>A reservation holds one vehicle. No payment is taken online.</p><div className="detail-actions"><button type="button" aria-pressed={favorites.includes(vehicle.id)} onClick={()=>toggleFavorite(vehicle.id)}><Heart size={18}/>{favorites.includes(vehicle.id)?'Saved to favorites':'Save to favorites'}</button><button type="button" aria-pressed={compare.includes(vehicle.id)} onClick={compareClick}><Scale size={18}/>{compare.includes(vehicle.id)?'Remove from compare':'Add to compare'}</button></div>{message&&<p role="status" className="inline-note">{message}</p>}{vehicle.quantity>0?<Link className="btn primary full" to={user?`/reserve/${vehicle.id}`:`/login?next=${encodeURIComponent(`/reserve/${vehicle.id}`)}`}>Review reservation</Link>:<button className="btn primary full" disabled>Currently unavailable</button>}</section></div></div>
  </>}</main><Footer/></>;
}
