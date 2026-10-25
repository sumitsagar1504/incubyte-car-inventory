import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {vehicleApi} from '../api';
import {Header,Footer,VehicleCard} from '../components/Chrome';
import {money} from '../media';
import {useSavedCars} from '../saved';
import type {Vehicle} from '../types';

function useVehicles(ids:string[]){
  const [vehicles,setVehicles]=useState<Vehicle[]|null>(null);
  const [error,setError]=useState('');
  const key=ids.join(',');
  useEffect(()=>{let active=true;setVehicles(null);Promise.allSettled(ids.map(id=>vehicleApi.get(id))).then(results=>{if(active)setVehicles(results.filter((result):result is PromiseFulfilledResult<Vehicle>=>result.status==='fulfilled').map(result=>result.value))}).catch(cause=>{if(active)setError((cause as Error).message)});return()=>{active=false}},[key]);
  return {vehicles,error};
}

export function Favorites(){
  const {favorites}=useSavedCars();
  const {vehicles,error}=useVehicles(favorites);
  return <><Header/><main className="container simple-page"><p className="eyebrow">YOUR SHORTLIST</p><h1>Favorite vehicles</h1>{error&&<p className="notice error" role="alert">{error}</p>}{!vehicles?<p className="state">Loading favorites…</p>:vehicles.length===0?<p className="state">No favorites yet. <Link to="/">Explore the collection</Link>.</p>:<div className="vehicle-grid">{vehicles.map(vehicle=><VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div>}</main><Footer/></>;
}

export function Compare(){
  const {compare,clearCompare}=useSavedCars();
  const {vehicles,error}=useVehicles(compare);
  return <><Header/><main className="container simple-page"><div className="section-heading"><div><p className="eyebrow">SIDE BY SIDE</p><h1>Compare vehicles</h1></div>{compare.length>0&&<button className="btn outline" onClick={clearCompare}>Clear comparison</button>}</div><p>Choose up to three vehicles from the collection.</p>{error&&<p className="notice error" role="alert">{error}</p>}{!vehicles?<p className="state">Loading comparison…</p>:vehicles.length===0?<p className="state">No vehicles selected. <Link to="/">Browse vehicles</Link>.</p>:<div className="compare-scroll"><table className="compare-table"><caption className="sr-only">Comparison of selected vehicles</caption><thead><tr><th scope="col">Details</th>{vehicles.map(vehicle=><th scope="col" key={vehicle.id}><Link to={`/vehicles/${vehicle.id}`}>{vehicle.make} {vehicle.model}</Link></th>)}</tr></thead><tbody>
    <tr><th scope="row">Price</th>{vehicles.map(vehicle=><td key={vehicle.id}>{money(vehicle.price)}</td>)}</tr>
    <tr><th scope="row">Availability</th>{vehicles.map(vehicle=><td key={vehicle.id}>{vehicle.quantity>0?`${vehicle.quantity} in stock`:'Out of stock'}</td>)}</tr>
    <tr><th scope="row">Year</th>{vehicles.map(vehicle=><td key={vehicle.id}>{vehicle.year??'Ask us'}</td>)}</tr>
    <tr><th scope="row">Mileage</th>{vehicles.map(vehicle=><td key={vehicle.id}>{vehicle.mileage!=null?`${vehicle.mileage.toLocaleString()} mi`:'Ask us'}</td>)}</tr>
    <tr><th scope="row">Fuel</th>{vehicles.map(vehicle=><td key={vehicle.id}>{vehicle.fuelType||'Ask us'}</td>)}</tr>
    <tr><th scope="row">Transmission</th>{vehicles.map(vehicle=><td key={vehicle.id}>{vehicle.transmission||'Ask us'}</td>)}</tr>
    <tr><th scope="row">Category</th>{vehicles.map(vehicle=><td key={vehicle.id}>{vehicle.category}</td>)}</tr>
    <tr><th scope="row">Explore</th>{vehicles.map(vehicle=><td key={vehicle.id}><Link className="btn outline" to={`/vehicles/${vehicle.id}`}>View details</Link></td>)}</tr>
  </tbody></table></div>}</main><Footer/></>;
}
