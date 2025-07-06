export interface CarInput {
    name:string;
    type:string;
    color:string;
    price:number
    seats?:string
    used?:boolean
}

export interface BookInput {
    title:string;
    price:number;
    borrowed?:boolean;
    quantity:number;
}