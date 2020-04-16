import { MovieDto } from "../models/movie.dto";
import { ValidateNested, IsObject } from "class-validator";
import { Type } from "class-transformer";

export class AddMovieDto {
    @ValidateNested()
    @Type(() => MovieDto)
    @IsObject()
    movie!: MovieDto;
}