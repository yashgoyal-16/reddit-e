import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChatAltIcon,
  GiftIcon,
  ShareIcon,
  BookmarkIcon,
  DotsHorizontalIcon,
} from "@heroicons/react/outline";
import React, { useEffect } from "react";
import Avatar from "./Avatar";
import TimeAgo from "react-timeago";
import toast from "react-hot-toast";
import Link from "next/link";
import Jelly from "@uiball/loaders/dist/components/Jelly";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_VOTES_BY_POST_ID } from "../graphql/queries";
import { ADD_VOTE } from "../graphql/mutations";

type Props = {
  post: Post;
};

function Post({ post }: Props) {
  const [vote, setVote] = useState<boolean>()
  const { data: session } = useSession()

  const {data, loading} = useQuery(GET_ALL_VOTES_BY_POST_ID, {
    variables: {
      post_id: post?.id
    }
  })

  const [addVote] = useMutation(ADD_VOTE,{
    refetchQueries: [GET_ALL_VOTES_BY_POST_ID, 'getVotesByPostId'],
  })

  const upVote = async (isUpvote: boolean) => {
    if (!session) {
      toast("! You need to sign in to vote!")
      return
    }
  

    if (vote &&  isUpvote) return
    if (vote === false && !isUpvote) return

    console.log('voting.......', isUpvote)


    await addVote({
      variables: {
        post_id: post.id,
        username: session.user?.name,
        upvote: isUpvote
      },
    })
}

  useEffect(() => {
    const votes: Vote[] = data?.getVotesByPostId
    const vote = votes?.find(vote => vote.username == session?.user?.name)?.upvote
    setVote(vote)
  
  }, [data])

  const displayVotes = (data: any) => { 
    const votes: Vote[] = data?.getVotesByPostId
    const displayNumber = votes?.reduce((total, vote) => (vote.upvote ? (total += 1) : (total -= 1)), 0)
    if (votes?.length === 0) return 0
    if (displayNumber === 0) {
      return votes[0]?.upvote ? 1 : -1
    }
    return displayNumber;
  }

  if (!post)

    return (
      <div className="flex w-full items-center justify-center p-10 text-xl">
        <Jelly size={50} color="#FF4501" />
      </div>
    );

  console.log("Rendering Post component");

  return (
    <Link href={`/post/${post.id}`}>
      <div className="flex cursor-pointer rounded-md border border-gray-300 bg-white shadow-sm hover:border hover:border-gray-600">
        <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md bg-grey-50 text-gray-400">
          <ArrowUpIcon 
          onClick={() => upVote(true)} className={`voteButtons hover:text-red-400 ${vote && 'text-red-400'}`} />
          <p className="text-xs font-bold text-black">{displayVotes(data)}</p>
          <ArrowDownIcon
          onClick={() => upVote(false)}
          className={`voteButtons hover:text-blue-400 ${vote === false && 'text-blue-400'}`}/>
        </div>
        <div className="p-3 pb-1">
          <div className="flex items-center space-x-2">
            <Avatar seed={post.subreddit?.[0]?.topic} />
            <p className="text-xs text-gray-400">
              <Link href={`/subreddit/${post.subreddit?.[0]?.topic}`}>
                <span className="font-bold text-black hover:text-blue-400 hover:underline">
                  r/{post.subreddit?.[0]?.topic}
                </span>
              </Link>{" "}
              posted by u/{post.username} <TimeAgo date={post.created_at} />
            </p>
          </div>
          {/* Body */}
          <div className="py-4">
            <p className="text-xl font-semibold">{post.tittle}</p>
            <p className="mt-2 text-sm font-light">{post.body}</p>
          </div>
          {/* Image */}
          <img className="w-full" src={post.image} alt="" />
          {/* footer */}
          <div className="flex space-x-4 text-gray-400">
            <div className="postButton">
              <ChatAltIcon className="h-6 w-6" />
              <p>{post.comments ? post.comments.length : 0} Comments</p>
            </div>
            <div className="postButton">
              <GiftIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Award</p>
            </div>
            <div className="postButton">
              <ShareIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Share</p>
            </div>
            <div className="postButton">
              <BookmarkIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Save</p>
            </div>
            <div className="postButton">
              <DotsHorizontalIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Post;
