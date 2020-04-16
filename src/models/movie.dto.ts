import {IsString, MaxLength, IsOptional, IsNumber} from "class-validator";
import { MovieEntity } from "./movie.entity";

export class MovieDto {
    @IsString()
    @MaxLength(255)
    title!: string;
    @IsNumber()
    year!: number; // string in db
    @IsNumber()
    runtime!: number; // string in db

    @IsString({each: true})
    genres!: string[];
    @IsString()
    @MaxLength(255) 
    director!: string;

    // Optionals

    @IsOptional()
    @IsString()
    actors!: string;
    @IsOptional()
    @IsString()
    plot!: string;
    @IsOptional()
    @IsString() 
    posterUrl!: string;

    toModel(): MovieEntity {
        return Object.assign(new MovieEntity(), {
            id: undefined,
            title: this.title,
            
            year: this.year.toString(),
            runtime: this.runtime.toString(),

            genres: this.genres,
            director: this.director,

            actors: this.actors,
            plot: this.plot,
            posterUrl: this.posterUrl
        })
    }
}

/*
- a list of genres (only predefined ones from db file) (required, array of predefined strings)
- title (required, string, max 255 characters)
- year (required, number) --> string in db :/
- runtime (required, number) ---? string in db :/
- director (required, string, max 255 characters)

- actors (optional, string)
- plot (optional, string)
- posterUrl (optional, string)
*/