import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, createHttpLink } from "@apollo/client";
import { ADD_POST, ADD_SUBREDDIT } from "../graphql/mutations";
import client from "@/pages/apollo-client";
import { GET_SUBREDDIT_BY_TOPIC } from "../graphql/queries";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { PhotographIcon, LinkIcon } from "@heroicons/react/outline";
import Avatar from "./Avatar";
import { GET_ALL_POSTS } from "../graphql/queries";

type FormData = {
  postTitle: string;
  postBody: string;
  postImage: string;
  subreddit: string;
};

const httpLink = createHttpLink({
  uri: "https://kanie.stepzen.net/api/modest-salamander/__graphqlhttps://kanie.stepzen.net/api/modest-salamander/__graphql", // Adjust this path
});

type Props = {
  subreddit?: string
}

function Postbox({ subreddit }: Props) {
  console.log(subreddit);
  const { data: session } = useSession();
  const [addPost] = useMutation(ADD_POST, {
    refetchQueries: [GET_ALL_POSTS, "postList"],
  });
  const [addSubreddit] = useMutation(ADD_SUBREDDIT);
  const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false);
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const promise = new Promise(async (resolve, reject) => {
        const {
          data: { getSubredditListByTopic },
        } = await client.query({
          query: GET_SUBREDDIT_BY_TOPIC,
          variables: {
            topic: subreddit || formData.subreddit,
          },
        })

        const subredditExists = getSubredditListByTopic.length > 0;

        if (!subredditExists) {
          console.log("Subreddit is new! -> creating a new subreddit!");

          const subredditValue = subreddit || formData.subreddit;
          console.log("Creating post...", formData);
          const {
            data: { insertSubreddit: newSubreddit },
          } = await addSubreddit({
            variables: {
              topic: subredditValue,
              created_at: new Date().toISOString(),
            },
          });

          console.log("Creating post...", formData);
          const image = formData.postImage || "";

          const {
            data: { insertPost: createdPost },
          } = await addPost({
            variables: {
              body: formData.postBody,
              image: image,
              subreddit_id: newSubreddit.id,
              tittle: formData.postTitle,
              username: session?.user?.name,
            },
          });
          console.log("New post added: ", createdPost);

          resolve(createdPost);
        } else {
          console.log("Using an existing subreddit!");
          console.log(getSubredditListByTopic);

          const image = formData.postImage || "";

          const {
            data: { insertPost: createdPost },
          } = await addPost({
            variables: {
              body: formData.postBody,
              image: image,
              subreddit_id: getSubredditListByTopic[0].id,
              tittle: formData.postTitle,
              username: session?.user?.name,
            },
          });
          console.log("New post added:", createdPost);

          resolve(createdPost);
        }
      });

      toast.promise(
        promise,
        {
          loading: "Creating new post...",
          success: (createdPost) => {
            setValue("postBody", "");
            setValue("postImage", "");
            setValue("postTitle", "");
            setValue("subreddit", "");
            return `New post created:`;
          },
          error: "Whoops, something went wrong!",
        },
        {
          success: {
            duration: 3000, // Adjust the duration for how long the success message should be shown
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Whoops, something went wrong!");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-20 z-50 rounded-md border border-gray-300 bg-white p-2"
    >
      <div className="flex items-center space-x-3">
        <Avatar />
        <input
          {...register("postTitle", { required: true })}
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
          type="text"
          placeholder={
            session ? subreddit ? `Create a post in r/${subreddit}` : "Create a post by entering a tittle!" : "Sign in to post"    
          }
        />
        <PhotographIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 cursor-pointer text-gray-300 ${
            imageBoxOpen ? "text-blue-30" : ""
          }`}
        />
        <LinkIcon className="h-6 text-gray-300" />
      </div>

      {!!watch("postTitle") && (
        <div className="flex flex-col py-2">
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              {...register("postBody")}
              type="text"
              placeholder="Text (optional)"
            />
          </div>
          {!subreddit && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Subreddit:</p>
              <input
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                {...register("subreddit", { required: true })}
                type="text"
                placeholder="i.e react js"
              />
            </div>
          )}

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image URL:</p>
              <input
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                {...register("postImage")}
                type="text"
                placeholder=" Optional....."
              />
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500 ">
              {errors.postTitle?.type === "required" && (
                <p> A Post tittle is required</p>
              )}
              {errors.subreddit?.type === "required" && (
                <p> A Subredit is required </p>
              )}
            </div>
          )}
          {!!watch("postTitle") && (
            <button
              type="submit"
              className="w-full rounded-full bg-blue-400 p-2 text-white"
            >
              Create Post
            </button>
          )}
        </div>
      )}
    </form>
  );
}

export default Postbox
