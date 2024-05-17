import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export default class Usuario{
    @PrimaryGeneratedColumn()
    id!: number 
    @Column()
    nombre!:string
    @Column({unique:true})
    email!: string  
    @Column()
    contraseña!: string  

    constructor(nombre:string, email:string, contraseña:string){
        this.nombre= nombre;
        this.email= email;
        this.contraseña= contraseña;
    }

}