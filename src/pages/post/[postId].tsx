import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { GET_POST_BY_POST_ID } from "../../../graphql/queries";
import Post from "../../../components/Post";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@apollo/client";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ADD_COMMENT } from "../../../graphql/mutations"
import Avatar from "../../../components/Avatar";
import TimeAgo from "react-timeago";

type FormData = {
  comment: string;
};

function PostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [GET_POST_BY_POST_ID, "getPostListByPostId"],
  });

  const { data,loading,error } = useQuery(GET_POST_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  });


  const post: Post = data?.getPostListByPostId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!data.comment || !data.comment.trim()) {
      // If the comment is empty or contains only whitespace
      toast.error("Please enter a comment before submitting.");
      return; // Do not proceed with submission
    }
  
    const notification = toast.loading("Posting your comment...");
    await addComment({
      variables: {
        post_id: router.query.postId,
        username: session?.user?.name,
        text: data.comment,
      },
    });
  
    setValue('comment','');
    toast.success("Comment posted successfully!", {
      id: notification,
    });
  };
  

  useEffect(() => {
    register("comment");
  }, [register]);
  console.log(data)

  return (
    <div className="mx-auto my-7 max-w-5xl">
      <Post post={post} />
      <div className="-mt-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-5 pl-16">
        <p className="text-sm">
          comment as{" "}
          <span className="text-red-500">{session?.user?.name}</span>
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-2"
        >
          <textarea
            disabled={!session}
            {...register("comment")}
            className="h-24 rounded-md border border-gray-200 p-2 pl-4 outline-none disabled:bg-gray-50"
            placeholder={
              session
                ? "What are your thoughts?"
                : "please sign in to comment"
            }
          />

          <button
            disabled={!session}
            type="submit"
            className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
          >
            Comment
          </button>
        </form>
      </div>

      {post?.comments.map((comment) => (
        <div className="-my-5 rounded-b-md border border-t-0 border-gray-300 bg-white py-5 px-10" key={comment.id}>
          <hr className="absolute top-10 h-16 border left-" />
          <div className="z-50">
            <Avatar seed={comment.username} />
          </div>

          <div className="flex flex-col">
            <p className="py-2 text-xs text-gray-400">
              <span className="font-semibold text-gray-400 ">{comment.username}</span>{' '}
              . <TimeAgo date ={comment.created_at} /></p>
            <p>  
              {comment.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostPage;

