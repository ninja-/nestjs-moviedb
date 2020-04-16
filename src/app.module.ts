import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieDatabaseService } from './movie-database.service';
import { MovieRandomizerService } from './movie-randomizer.service';

@Module({
  imports: [],
  controllers: [MovieController],
  providers: [
    MovieDatabaseService, 
    MovieRandomizerService,
    {
      provide: 'DB_NO_SAVE',
      useValue: false
    },
    {
      provide: 'DB_FILE',
      useValue: 'data/db.json'
    }
],
})
export class AppModule {}
