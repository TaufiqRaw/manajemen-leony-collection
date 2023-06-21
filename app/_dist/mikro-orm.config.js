"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const reflection_1 = require("@mikro-orm/reflection");
const config = {
    entities: ['./dist/modules/**/*.entity.js'],
    entitiesTs: ['./src/modules/**/*.entity.ts'],
    metadataProvider: reflection_1.TsMorphMetadataProvider,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME || 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    type: 'postgresql',
    migrations: {
        path: 'dist/database/migrations',
        pathTs: 'src/database/migrations',
    },
    seeder: {
        path: 'dist/database/seeder',
        pathTs: 'src/database/seeder'
    }
};
exports.default = config;
