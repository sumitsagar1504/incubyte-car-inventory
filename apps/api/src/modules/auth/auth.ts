import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/errors.js';

const credentials = z.object({email:z.string().trim().toLowerCase().pipe(z.email()),password:z.string().min(8).max(128)});
const registration = credentials.extend({name:z.string().trim().min(2).max(100)});
export const authRouter = Router();

authRouter.post('/register', async (req,res) => {
  const data = registration.parse(req.body);
  const existing = await db.user.findUnique({where:{email:data.email}});
  if (existing) throw new HttpError(409,'Email already registered');
  const passwordHash = await bcrypt.hash(data.password,12);
  try {
    const user = await db.user.create({data:{name:data.name,email:data.email,passwordHash}});
    res.status(201).json({user:publicUser(user)});
  } catch (error) {
    if ((error as {code?:string}).code === 'P2002') throw new HttpError(409,'Email already registered');
    throw error;
  }
});
authRouter.post('/login', async (req,res) => {
  const data = credentials.parse(req.body);
  const user = await db.user.findUnique({where:{email:data.email}});
  if (!user || !(await bcrypt.compare(data.password,user.passwordHash))) throw new HttpError(401,'Invalid credentials');
  const token = jwt.sign({sub:user.id},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']});
  res.json({token,user:publicUser(user)});
});

function publicUser(user:{id:string;name:string;email:string;role:string}) {
  return {id:user.id,name:user.name,email:user.email,role:user.role};
}

export interface AuthRequest extends Request { auth?: {id:string;role:'USER'|'ADMIN'} }
export async function requireAuth(req:AuthRequest,_res:Response,next:NextFunction) {
  try {
    const raw = req.headers.authorization;
    if (!raw?.startsWith('Bearer ')) throw new HttpError(401,'Authentication required');
    let payload: jwt.JwtPayload;
    try { payload = jwt.verify(raw.slice(7),env.JWT_SECRET) as jwt.JwtPayload; }
    catch { throw new HttpError(401,'Invalid or expired token'); }
    const user = await db.user.findUnique({where:{id:String(payload.sub)}});
    if (!user) throw new HttpError(401,'Invalid token');
    req.auth = {id:user.id,role:user.role};
    next();
  } catch(error) { next(error); }
}
export function requireAdmin(req:AuthRequest,_res:Response,next:NextFunction) {
  if (req.auth?.role !== 'ADMIN') return next(new HttpError(403,'Admin access required'));
  next();
}
