import {DataSource} from "typeorm"
import  Usuario  from "../entities/user";

export const AppDataSource= new DataSource({
    type: "mysql",
    host:"localhost",
    port:3306,
    username:"root",
    password:"1234",
    database:"backend",
    synchronize:true,
    logging:true,
    entities:[Usuario],
    subscribers:[],
    migrations:[]
})