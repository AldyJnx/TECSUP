import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Post from "./src/models/Post.js";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB conectado exitosamente");
    } catch (error) {
        console.error("Error al conectar MongoDB:", error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Limpiar las colecciones
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log("Colecciones limpiadas");

        // Crear usuarios
        const users = await User.insertMany([
            {
                name: "Carlos",
                lastName: "Gamer",
                email: "carlos@gaming.com",
                age: 25,
                phoneNumber: "987654321",
                password: "password123"
            },
            {
                name: "Maria",
                lastName: "Rodriguez",
                email: "maria@gaming.com",
                age: 28,
                phoneNumber: "987654322",
                password: "password123"
            },
            {
                name: "Juan",
                lastName: "Lopez",
                email: "juan@gaming.com",
                age: 22,
                phoneNumber: "987654323",
                password: "password123"
            }
        ]);
        console.log("Usuarios creados");

        // Crear posts sobre juegos
        const posts = await Post.insertMany([
            {
                title: "The Legend of Zelda TOTK",
                content: "Tears of the Kingdom es simplemente increible. La libertad de exploracion y las mecanicas de construccion llevan el juego a otro nivel.",
                user: users[0]._id,
                hashtags: ["zelda", "nintendo", "switch", "aventura"],
                imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800",
                createdAt: new Date("2024-03-15")
            },
            {
                title: "Elden Ring es brutal",
                content: "Despues de 100 horas finalmente complete Elden Ring. FromSoftware creo una obra maestra del genero souls-like. La dificultad es desafiante pero justa.",
                user: users[1]._id,
                hashtags: ["eldenring", "fromsoftware", "rpg", "souls"],
                imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
                createdAt: new Date("2024-03-18")
            },
            {
                title: "Baldurs Gate 3 GOTY",
                content: "BG3 se merece todos los premios. La narrativa, las opciones de personalizacion y las consecuencias de cada decision hacen que cada partida sea unica.",
                user: users[0]._id,
                hashtags: ["baldursgate3", "rpg", "larian", "dnd"],
                imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
                createdAt: new Date("2024-03-20")
            },
            {
                title: "Hollow Knight perfecto",
                content: "Este metroidvania indie es una joya absoluta. El arte, la musica y el gameplay son de primera clase. Totalmente recomendado para fans del genero.",
                user: users[2]._id,
                hashtags: ["hollowknight", "indie", "metroidvania"],
                imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800",
                createdAt: new Date("2024-03-22")
            },
            {
                title: "Stardew Valley addiction",
                content: "No puedo dejar de jugar Stardew Valley. Es el juego perfecto para relajarse despues de un dia estresante. La granja nunca deja de crecer.",
                user: users[1]._id,
                hashtags: ["stardewvalley", "farming", "indie", "relaxing"],
                imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
                createdAt: new Date("2024-03-25")
            },
            {
                title: "Cyberpunk 2077 redimido",
                content: "Despues de todas las actualizaciones, Cyberpunk 2077 es finalmente el juego que prometieron. Night City es impresionante y las misiones son excelentes.",
                user: users[0]._id,
                hashtags: ["cyberpunk2077", "cdprojektred", "rpg", "scifi"],
                createdAt: new Date("2024-03-28")
            },
            {
                title: "Hades roguelike perfecto",
                content: "Hades demuestra como hacer un roguelike correcto. Cada run se siente diferente y la historia progresa de manera brillante. Supergiant es genial.",
                user: users[2]._id,
                hashtags: ["hades", "roguelike", "supergiant", "indie"],
                imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
                createdAt: new Date("2024-04-01")
            },
            {
                title: "Final Fantasy XVI epico",
                content: "FF XVI es una reinvencion total de la serie. El sistema de combate en tiempo real es adictivo y la historia es emocional. Una experiencia inolvidable.",
                user: users[1]._id,
                hashtags: ["finalfantasy", "ff16", "jrpg", "playstation"],
                imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800",
                createdAt: new Date("2024-04-05")
            }
        ]);
        console.log("Posts creados");

        console.log("\nDatos de ejemplo agregados exitosamente!");
        console.log(`- ${users.length} usuarios creados`);
        console.log(`- ${posts.length} posts creados`);

        process.exit(0);
    } catch (error) {
        console.error("Error al agregar datos:", error);
        process.exit(1);
    }
};

connectDB().then(() => seedData());
