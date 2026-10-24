import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AuthProvider} from './auth';
import App from './App';
const mocks=vi.hoisted(()=>({list:vi.fn()}));
vi.mock('./api',async(importOriginal)=>{const original=await importOriginal<typeof import('./api')>();return {...original,vehicleApi:{...original.vehicleApi,list:mocks.list}}});
beforeEach(()=>{localStorage.clear();mocks.list.mockResolvedValue({items:[{id:'v1',make:'Volvo',model:'XC90',category:'SUV',price:'58500',quantity:0,createdAt:''}],total:1,page:1,limit:12})});
afterEach(cleanup);
describe('inventory UI',()=>{
  it('requires login for the collection',()=>{render(<MemoryRouter initialEntries={['/']}><AuthProvider><App/></AuthProvider></MemoryRouter>);expect(screen.getByText('Welcome back')).toBeTruthy()});
  it('disables purchase when stock is zero and logs out',async()=>{localStorage.setItem('token','token');localStorage.setItem('user',JSON.stringify({id:'u1',name:'Test',email:'test@example.com',role:'USER'}));render(<MemoryRouter initialEntries={['/']}><AuthProvider><App/></AuthProvider></MemoryRouter>);await waitFor(()=>expect(screen.getByText('XC90')).toBeTruthy());expect((screen.getByRole('button',{name:/Unavailable/}) as HTMLButtonElement).disabled).toBe(true);fireEvent.click(screen.getByRole('button',{name:'Sign out'}));expect(screen.getByText('Welcome back')).toBeTruthy()});
});
