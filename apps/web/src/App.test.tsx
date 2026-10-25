import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AuthProvider} from './auth';
import {SavedCarsProvider} from './saved';
import App from './App';
const vehicle={id:'11111111-1111-4111-8111-111111111111',make:'Volvo',model:'XC90',category:'SUV',price:'58500',quantity:0,year:null,mileage:null,fuelType:null,transmission:null,description:null,features:[],images:[],createdAt:''};
const mocks=vi.hoisted(()=>({list:vi.fn(),get:vi.fn()}));
vi.mock('./api',async(importOriginal)=>{const original=await importOriginal<typeof import('./api')>();return {...original,vehicleApi:{...original.vehicleApi,list:mocks.list,get:mocks.get}}});
function show(path='/'){return render(<MemoryRouter initialEntries={[path]}><AuthProvider><SavedCarsProvider><App/></SavedCarsProvider></AuthProvider></MemoryRouter>)}
beforeEach(()=>{localStorage.clear();mocks.list.mockResolvedValue({items:[vehicle],total:1,page:1,limit:12});mocks.get.mockResolvedValue(vehicle)});
afterEach(cleanup);
describe('customer browsing',()=>{
  it('lets guests browse the collection and vehicle details',async()=>{show();expect(await screen.findByText('XC90')).toBeTruthy();expect(screen.getByText(/Browse freely/)).toBeTruthy();fireEvent.click(screen.getByRole('link',{name:'View details'}));expect(await screen.findByRole('heading',{name:'Volvo XC90'})).toBeTruthy();expect(screen.getByText(/Model photos are illustrative/)).toBeTruthy()});
  it('sends a guest to sign in before reservation',()=>{show(`/reserve/${vehicle.id}`);expect(screen.getByRole('heading',{name:'Welcome back'})).toBeTruthy()});
  it('saves a favorite without creating an account',async()=>{show();await screen.findByText('XC90');fireEvent.click(screen.getByRole('button',{name:'Save'}));fireEvent.click(screen.getByRole('link',{name:/Favorites/}));expect(await screen.findByText('XC90')).toBeTruthy()});
});
