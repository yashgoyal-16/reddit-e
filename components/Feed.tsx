import React from 'react';
import { GET_ALL_POSTS, GET_ALL_POSTS_BY_TOPIC } from '../graphql/queries';
import { useQuery } from '@apollo/client';
import Post from './Post';
import Avatar from './Avatar';

type Props = {
  topic?: string
}

function Feed({ topic }: Props) {
  
  const { data } = !topic ? useQuery(GET_ALL_POSTS) : useQuery(GET_ALL_POSTS_BY_TOPIC,
    {
      variables: {
      topic: topic,
    },
  })

  const posts: Post[] = !topic ? data?.postList : data?.getPostListByTopic
  console.log(posts)

  return (
    <div className='mt-5 space-y-4'  >
      
      {posts?.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Feed;
