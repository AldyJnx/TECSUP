import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // carga las variables desde .env
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB conectado exitosamente");
        console.log(`Base de datos: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error.message);
        process.exit(1); // Detiene la app si no conecta
    }
};

export default connectDB;
