const {promisify} = require('util')
import fs = require('fs');
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { MovieDatabase } from './models/movie-database.entity';
import { MovieEntity } from './models/movie.entity';

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

@Injectable()
export class MovieDatabaseService implements OnModuleInit {
    private disableSave?: boolean
    data: MovieDatabase;
    file: string;

    constructor(@Inject('DB_FILE') file, @Inject('DB_NO_SAVE') disableSave?: boolean) {
        this.file = file
        this.disableSave = disableSave
    }

    async onModuleInit() {
        await this.load();
    }
    
    async load() {
        this.data = JSON.parse(await readFileAsync(this.file))
        this.data.movies = this.data.movies.map(MovieEntity.fromObject) as any
        console.log('Loaded database')
    }

    async save() {
        if (!this.data) {
            throw new Error('Cannot save empty database')
        }
        if (!this.disableSave) {
            await writeFileAsync(this.file, this.data)
        }
        console.log('Saved database with disableSave='  + this.disableSave)
    }

    async addMovie(movie: MovieEntity) {
        if (!movie.checkGenresValid(this.data.genres)) {
            // This could be at class-validator level if our genres weren't stored in database
            throw new Error('Invalid genres in array: ' + movie.genres)
        }

        let movies = this.data.movies
        movie.id = movies[movies.length - 1].id + 1
        movies.push(movie)
        await this.save();
        return movie
    }

    async hasGenre(genre: string) {
        return this.data.genres.includes(genre)
    }
}