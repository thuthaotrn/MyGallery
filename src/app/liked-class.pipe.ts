import { Pipe, PipeTransform } from '@angular/core';
import { Video } from './video';

@Pipe({
  name: 'likedClass',
  pure: false
})
export class LikedClassPipe implements PipeTransform {

  transform(video: Video, username: string|null):string{
    console.log(username);
      if(!username) return 'bi bi-heart'
      if(video.likedBy.includes(username)) return 'bi bi-heart-fill text-danger'
      return 'bi bi-heart'
  }

}
