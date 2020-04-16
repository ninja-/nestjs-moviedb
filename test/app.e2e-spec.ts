import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MovieDatabaseService } from '../src/movie-database.service';
import { MovieController } from '../src/movie.controller';
import { MovieRandomizerService } from '../src/movie-randomizer.service';

// Usually I'd prepare a sepeare layer of tests on controller level but it's too much of a hassle for now.

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        MovieDatabaseService, 
        MovieRandomizerService,
        {
          provide: 'DB_NO_SAVE',
          useValue: true
        },
        {
          provide: 'DB_FILE',
          useValue: 'data/db-test.json'
        }    
      ],
      controllers: [MovieController]
    }).compile();

    await moduleFixture.init()

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true
      }),
    );
      
    await app.init();
  });

  it('Properly inserts new movie (PUT)', async () => {
    // Edge cases for future tests:
    // - exceeding allowed field length
    // - invalid genres in array
    // - not providing required fields

    let movie = {
      title: 'Test movie',
      director: 'Tim',
      genres: ["Comedy"],
      plot: "bla",
      posterUrl: "",
      runtime: 92,
      year: 2020
    }

    const response = await request(app.getHttpServer())
      .put('/movies/')
      .send({movie: movie})
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(movie)

    // Find it on global list now
    const allMovies = await request(app.getHttpServer())
      .get('/movies/')
    const myMovie = allMovies.body.find(m => m.title == movie.title)
    expect(myMovie).toEqual(movie)
  });
  
  it('Properly chooses random movies based on algorithm', async () => {
    // Edge cases for future tests:
    // - handling limit
    // - empty genres[]

    const args = {
      limit: 10,
      genres: ["Comedy", "Drama"],
      duration: 110
    }

    // Store a snapshot
    // I am a big fan of snapshot testing lately :D
    // That comes from experience in a project where changing say user model broke 50 different tests because of hardcoded data :(
    // And with snapshots this could be automated by using jest --updateSnapshots

    const response = await request(app.getHttpServer())
      .get('/movies/random')
      .send(args)

    const body = response.body
    expect(body).toMatchSnapshot()

  })
});
