import { MovieDatabaseService } from "./movie-database.service";
import { GetRandomMovieDto } from "./dto/get-random-movie.dto";
import { Injectable } from "@nestjs/common";
import { MovieEntity } from "./models/movie.entity";

type MovieWithScore = MovieEntity & { score?: number }

@Injectable()
export class MovieRandomizerService {
    constructor(private readonly database: MovieDatabaseService) {}

    private shuffleArray<T>(array: T[]): void {
        // Shuffle in place
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    getMovieScore(movie: MovieEntity, genres: string[]) {
        let score = 0
        let matches = 0

        let multiplier = genres.length
        for (let genre of genres) {
            // For each genre, check if we have a match.
            // The score addition will be higher when the genre is earlier in the array.

            // If we send a request with genres [Comedy, Fantasy, Crime] then the top hits should be movies that have all three of them, 
            // then there should be movies that have one of [Comedy, Fantasy][comedy, criem], [Fantasy, Crime] and then those with Comedy only, Fantasy only and Crime only.

            // [Comedy, Fantasy, Crime] = 3+2+1 = 6
            // [Comedy, Fantasy] = 3+2 = 5
            // [Comedy, Crime] = 3+1 = 4
            // [Fantasy, Crime] = 2+1 = 3
            // Comedy = 3, Fantasy = 2, Crime = 1

            // But hmm, that leaves as at the edge case with [Fantasy, Crime] vs Comedy
            // Let's try to solve that by using 2 to the power of N multipliers
            // So we work with: 8, 4, 2

            // [Comedy, Fantasy, Crime] = 8+4+2 = 14
            // [Comedy, Fantasy] = 8+4 = 12
            // [Comedy, Crime] = 8+2 = 10
            // [Fantasy, Crime] = 4+2 = 6
            // Comedy = 8, Fantasy = 4, Crime = 2

            // Ok looks like that was a poor idea. Now it's worse.

            // Let's try to multiply score by matches length instead.

            // [Comedy, Fantasy, Crime] = 3+2+1 = 6 * 3 = 18
            // [Comedy, Fantasy] = 3+2 = 5 * 2 = 10
            // [Comedy, Crime] = 3+1 = 4 * 2 = 8
            // [Fantasy, Crime] = 2+1 = 3 * 2 = 6
            // Comedy = 3, Fantasy = 2, Crime = 1

            // Now seems good.

            if (movie.genres.includes(genre)) {
                matches++
                score += multiplier
            }
            multiplier--
        }

        score *= matches
        return score
    }

    getRandomMovies(query: GetRandomMovieDto): MovieWithScore[] {
        // Take a copy
        let movies = [...this.database.data.movies] as MovieWithScore[]
        let {genres, duration} = query

        genres = genres && [...new Set(genres)] // Remove duplicates

        if (duration) {
            // Max 10 minutes difference
            movies = movies.filter(movie => Math.abs((+movie.runtime) - duration) <= 10)
        }
        
        if (!genres) {
            // Randomize order
            // return movies[Math.floor(Math.random() * movies.length)]
            this.shuffleArray(movies);

            if (query.limit) {
                movies = movies.slice(0, query.limit)
            }    
            return movies;
        }

        // Let's return all movies sorted to make testing easier
        // Controller can take and return the first one, if it wants to.

        let movieScores = movies.map(movie => this.getMovieScore(movie, genres));
        movies = movies.map((movie, index) => {
            return Object.assign(movie, {score: movieScores[index]})
        }) as MovieWithScore[]
        movies = movies.sort((a, b) => b.score - a.score)

        // console.log(movies)
        if (query.limit) {
            movies = movies.slice(0, query.limit)
        }
        
        return movies;
    }
}

/*
2. We also need an endpoint to return a random matching movie for us. What we want to do is to send a list of genres (this parameter is optional) and a duration of a movie we are looking for.

The special algorythm should first find all the movies that have all genres of our choice and runtime between <duration - 10> and <duration + 10>. Then it should repeat this algorytm for each genres combination. For example:

If we send a request with genres [Comedy, Fantasy, Crime] then the top hits should be movies that have all three of them, then there should be movies that have one of [Comedy, Fantasy][comedy, criem], [Fantasy, Crime] and then those with Comedy only, Fantasy only and Crime only.

Of course we dont want to have duplicates.

If we dont provide genres parameter then we get a single random movie with a runtime between <duration - 10> and <duration + 10>.

If we dont provide duration parameter then we should get all of the movie with specific genres.

If we dont provide any parameter, then we should get a single random movie.
*/