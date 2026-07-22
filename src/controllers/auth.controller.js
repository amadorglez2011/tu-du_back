import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Agregar arriba del archivo, junto a los otros imports:

const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || 'reset-secret-changeme';

// 6. SOLICITAR RECUPERACIÓN — devuelve la pregunta de seguridad
export async function getSecurityQuestion(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Favor de escribir tu correo, BROTHER." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No encontramos una cuenta con ese correo, BROTHER." });
        }

        return res.json({ securityQuestion: user.securityQuestion });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}

// 7. VERIFICAR RESPUESTA — genera token de reseteo si es correcta
export async function verifySecurityAnswer(req, res) {
    try {
        const { email, answer } = req.body;
        if (!email || !answer) {
            return res.status(400).json({ message: "Favor de llenar todos los campos, BROTHER." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No encontramos una cuenta con ese correo, BROTHER." });
        }

        const ok = await bcrypt.compare(answer.trim().toLowerCase(), user.securityAnswer);
        if (!ok) {
            return res.status(401).json({ message: "Respuesta incorrecta, BROTHER." });
        }

        const resetToken = jwt.sign(
            { id: user.id, purpose: 'password-reset' },
            RESET_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        return res.json({ resetToken });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}

// 8. RESETEAR CONTRASEÑA con el token
export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Favor de llenar todos los campos, BROTHER." });
        }

        if (newPassword.trim().length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
        }

        let payload;
        try {
            payload = jwt.verify(token, RESET_TOKEN_SECRET);
        } catch (e) {
            return res.status(401).json({ message: "El link de recuperación expiró o es inválido, BROTHER." });
        }

        if (payload.purpose !== 'password-reset') {
            return res.status(401).json({ message: "Token inválido, BROTHER." });
        }

        const hash = await bcrypt.hash(newPassword.trim(), 10);
        await User.findByIdAndUpdate(payload.id, { password: hash, $inc: { tokenVersion: 1 } });

        return res.json({ message: "Contraseña actualizada correctamente, BROTHER." });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Error en el servidor, BROTHER." });
    }
}

// 1. REGISTRO
export async function register(req, res) {
    try {
        const { name, email, password, securityQuestion, securityAnswer } = req.body;
        
        // Validación de campos vacíos
        if (!name || !email || !password || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: "Favor de llenar todos los campos, BROTHER." });
        }

        // Verificar si el correo ya existe
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "Usuario existente, BROTHER." });
        }

        // Encriptar contraseña y respuesta de seguridad
        const hash = await bcrypt.hash(password, 10);
        const answerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

        const user = new User({
            name,
            email,
            password: hash,
            securityQuestion,
            securityAnswer: answerHash
        });
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