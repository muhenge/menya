import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtGuard } from 'src/auth/guards';
import { CreatePostDto } from './dtos/createPost.dto';
import { GetAuthUser } from '../auth/decorators/';
import { User } from '../user/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtGuard)
  @Post()
  async createPost(
    @Body() createPost: CreatePostDto,
    @GetAuthUser() user: User,
  ) {
    return await this.postsService.createPost(createPost, user);
  }
}
