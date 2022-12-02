import { useForm } from "react-hook-form"
import axios from "axios";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { Spinner } from "components";

export default function Auth() {
  const { register, formState: { errors }, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async data => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/auth`, { name: data.name.toLowerCase() });
      if (res.data.token) {
        setCookie("token", res.data.token);
        setCookie("name", res.data.name)
        router.push("/");
      }
    } catch (ex) {
      console.error(ex);
    }
    setLoading(false);
  }
  return (
    <div className="custom-container flex justify-center items-center min-h-screen pb-20">
      <div className="w-[500px] bg-purple-100 rounded-lg overflow-hidden px-5 pt-5 pb-10">
        <h1 className="text-center text-[20px]">enter username for new <b className="text-purple-700 text-[40px]">Games</b>!</h1>
        <form onSubmit={handleSubmit(submit)} className="w-[80%] mx-auto">
          <span className="text-gray-400 w-[80%] block mx-auto mb-1">enter your name and start fun mailing!</span>
          <input
            type="text"
            placeholder="Smith"
            className={`w-full px-3 py-2.5 bg-white border-2 rounded-md duration-200 ${errors.name ? "border-red-600" : "border-purple-700"}`}
            {...register("name", {
              required: "please enter your name :(",
              minLength: {
                value: 2,
                message: "please enter at least 2 characters :(",
              },
              maxLength: {
                value: 100,
                message: "please enter at less than 100 characters :(",
              }
            })}
          />
          {errors.name?.message ? <span className="text-[14px] text-red-600">{errors.name?.message}</span> : null}
          <button
            disabled={loading}
            className={`flex items-center justify-center gap-3 text-white bg-purple-700 not-italic hover:italic duration-300 transition font-bold py-2 rounded-md w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:not-italic`}
            style={{ transition: "2s" }}
          >
            <span>{loading ? "STARTING" : "START NOW!"}</span>
            {loading ? <Spinner /> : null}
          </button>
        </form>
      </div>
    </div>
  )
}