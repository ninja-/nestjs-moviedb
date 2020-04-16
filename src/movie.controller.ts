import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { MovieDatabaseService } from './movie-database.service';
import { AddMovieDto } from './dto/add-movie.dto';
import { GetRandomMovieDto } from './dto/get-random-movie.dto';
import { MovieRandomizerService } from './movie-randomizer.service';

@Controller('/movies')
export class MovieController {
  constructor(
    private readonly movieDatabase: MovieDatabaseService,
    private readonly movieRandomizer: MovieRandomizerService
  ) {}

  @Get()
  getAllMovies() {
    return this.movieDatabase.data.movies.map(movie => movie.toDto()) as any
  }

  @Put()
  async addMovie(@Body() body: AddMovieDto) {
    let result = await this.movieDatabase.addMovie(body.movie.toModel());
    return result.toDto()   
  }

  @Get('randomTest')
  getRandomMovieDebug(
    @Query('genres') genres, @Query('duration') duration, @Query('limit') limit
  ) {
    let body = {genres: genres && genres.split(','), duration, limit}
    console.log(body)
    let movies = this.movieRandomizer.getRandomMovies(body)
    return movies
      .map(movie => movie.toDto())
      .slice(0, body.limit ?? 1)
  }

  // The proper endpoint with validation

  @Get('random')
  getRandomMovie(
    @Body() body: GetRandomMovieDto, 
  ) {
    let movies = this.movieRandomizer.getRandomMovies(body)
    return movies
      .map(movie => movie.toDto())
      .slice(0, body.limit ?? 1)
  }
}
