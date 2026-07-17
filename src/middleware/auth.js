import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function auth (req, res, next){
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer') ? header.slice(7) : null;
    if (!token) return res.status(401).json({message:'Token Requerido'});
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');

        const user = await User.findById(payload.id);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({message:'Sesión expirada, inicia sesión de nuevo'});
        }

        req.userId = payload.id;
        next();
    }catch(e){
        return res.status(401).json({message:'Token Invalido'});
    }
}