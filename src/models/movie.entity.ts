import { MovieDto } from "./movie.dto";

export class MovieEntity {
    id!: number;
    title!: string;

    year!: string; // number in dto
    runtime!: string; // number in dto

    genres!: string[];
    director!: string;

    actors!: string;
    plot!: string;
    posterUrl!: string

    checkGenresValid(allGenres: string[]) {
        for (let genre of this.genres) {
            if (!allGenres.includes(genre)) {
                return false
            }    
        }
        return true
    }

    toDto(): MovieDto {
        return Object.assign(new MovieDto(), {
            title: this.title,
            
            year: +this.year,
            runtime: +this.runtime,

            genres: this.genres,
            director: this.director,

            actors: this.actors,
            plot: this.plot,
            posterUrl: this.posterUrl
        })
    }
    
    static fromObject(data: any) {
        return Object.assign(new MovieEntity(), data);
    }
}
