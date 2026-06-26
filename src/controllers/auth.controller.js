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
            { id: user.id }, 
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
            { id: user.id }, 
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

        const user = await User.findById(req.userId).select('_id name email');
        return res.json({ user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}