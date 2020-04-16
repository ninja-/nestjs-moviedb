import { IsNumber, IsArray, IsString, IsOptional, IsPositive } from "class-validator";

export class GetRandomMovieDto {
    @IsNumber()
    @IsOptional()
    duration: number;

    @IsString({each: true})
    @IsOptional()
    genres: string[]

    @IsOptional()
    @IsPositive()
    limit: number
}