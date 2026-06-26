import mongoose from 'mongoose';

const connectDB = async () => {
  // Si ya está conectado, reutiliza la conexión activa
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado exitosamente a MongoDB Atlas");
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
  }
};

export default connectDB;