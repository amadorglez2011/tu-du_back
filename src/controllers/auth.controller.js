import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// 1. REGISTRO
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        
        // Validación de campos vacíos
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Favor de llenar todos los campos" });
        }

        // Verificar si el correo ya existe
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "Usuario existente, BROTHER." });
        }

        // Encriptar contraseña y guardar
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash });
        await user.save();

        // Generar Token JWT
        const token = jwt.sign(
            { id: user.id, tokenVersion: user.tokenVersion }, 
            process.env.JWT_SECRET || 'changeme', 
            { expiresIn: '10d' }
        );

        // Responder con éxito
        return res.status(201).json({token, user: {
                id: user.id, name: user.name,email: user.email
            }
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}


// 2. INICIO DE SESIÓN

export async function login(req, res) {
    try {   
        const { email, password } = req.body;
        
        
        const user = await User.findOne({ email });
        
        
        if (!user) {
            return res.status(404).json({ message: "Email ó contraseña incorrecta, BROTHER." });
        }

        
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(404).json({ message: "Email ó contraseña incorrecta, BROTHER." });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id: user.id, tokenVersion: user.tokenVersion }, 
            process.env.JWT_SECRET || 'changeme', 
            { expiresIn: '10d' }
        ); 

        return res.json({
            token, 
            user: {
                id: user.id, 
                name: user.name,
                email: user.email
            }
        });  

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}

// 3. PERFIL DEL USUARIO

export async function profile(req, res) {
    try {

        const user = await User.findById(req.userId).select('_id name email createdAt avatar');
        return res.json({ user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}

// 4. CERRAR SESIÓN EN TODOS LOS DISPOSITIVOS

export async function logoutAll(req, res) {
    try {
        await User.findByIdAndUpdate(req.userId, { $inc: { tokenVersion: 1 } });
        return res.json({ message: "Sesión cerrada en todos los dispositivos, BROTHER." });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}

// 5. ACTUALIZAR PERFIL (nombre, correo, contraseña, foto)

export async function updateProfile(req, res) {
    try {
        const { name, email, password, avatar } = req.body;
        const update = {};

        if (name && name.trim()) {
            update.name = name.trim();
        }

        if (email && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();
            const exists = await User.findOne({ email: normalizedEmail, _id: { $ne: req.userId } });
            if (exists) {
                return res.status(409).json({ message: "Ese correo ya está en uso, BROTHER." });
            }
            update.email = normalizedEmail;
        }

        if (avatar) {
            update.avatar = avatar; // string base64 (data URI) ya redimensionada desde el frontend
        }

        if (password && password.trim()) {
            if (password.trim().length < 6) {
                return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
            }
            update.password = await bcrypt.hash(password.trim(), 10);
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "No hay cambios para guardar." });
        }

        const user = await User.findByIdAndUpdate(req.userId, update, { new: true })
            .select('_id name email createdAt avatar');

        return res.json({ user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}