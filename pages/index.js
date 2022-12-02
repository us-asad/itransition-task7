import axios from "axios";
import { Spinner } from "components";
import { deleteCookie, getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { toast } from "react-toastify";
import { fetchGames, setAuthHeader, updateGame } from "utils/functions";

export default function Home({ games: gms }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [games, setGames] = useState(gms);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(null)
  const router = useRouter();
  const token = getCookie("token");

  const logout = () => {
    deleteCookie("name");
    deleteCookie("token");
    router.push("/auth");
  }

  const sendRequest = async data => {
    setLoading(true);
    const gameData = {
      second_player: data.second_player,
      game_starter_case: data.case
    };
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/send-request`, gameData, setAuthHeader(token));
      if (res.data._id) {
        setGames(prev => [res.data, ...prev]);
        toast.success("Game successfully created!");
      }
    } catch (ex) {
      console.error(ex);
      toast.error("Server error, please try again later")
    }
    setLoading(false)
  }

  const changeGameStatus = async (id, status) => {
    const data = await updateGame(id, token, { status });
    if (data?._id) {
      toast.success(status === "rejected" ? "Successfully rejected" : "Successfully accepted");
      if (status !== "rejected") router.push(`/games/${id}`);
    }
  }

  useEffect(() => {
    setUsername(getCookie("name"))

    const interval = setInterval(async () => {
      const data = await fetchGames(token);
      setGames(data);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="custom-container py-20">
      <div className="w-[800px] mx-auto bg-purple-100 px-8 pt-4 pb-16 rounded-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-[30px] font-bold text-center">Tic <span className="text-purple-700">Tac</span> Toe</h1>
          <button onClick={logout} className="px-5 py-1.5 bg-red-600 text-white rounded-md">Leave Account</button>
        </div>
        <div className="h-[350px] rounded-lg mt-3 bg-purple-200 overflow-hidden">
          <h2 className="text-[18px] px-6 pt-3 text-purple-700 font-bold">Last Games</h2>
          <div className="space-y-2 h-full overflow-y-auto overflow-x-hidden px-6 pt-2 pb-20">
            {games?.map((game, i) => (
              <div key={i} className="relative">
                <button
                  disabled={["pending", "rejected", "finished"].includes(game.status)}
                  onClick={() => router.push(`/games/${game._id}`)}
                  className={`w-full flex items-stretch justify-between px-3 py-2 rounded-md bg-purple-100 cursor-pointer hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  <div className="flex flex-col justify-around">
                    <div className="flex gap-2">
                      <h3><b>{game?.game_starter?.name}</b> ( {game?.game_starter?.case} )</h3>
                      <span>vs</span>
                      <h3><b>{game?.second_player?.name}</b> ( {game?.second_player?.case} )</h3>
                    </div>
                    <div className="space-x-3">
                      <span>status: <b>{game.status}</b></span>
                      <span className="text-[12px]">created at: {new Date(game.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-[70px] bg-white flex flex-wrap w-[100px]">
                    {game.movements?.map((movement, i) => (
                      <div key={i} className="w-[32%]">
                        {movement || "/"}
                      </div>
                    ))}
                  </div>
                </button>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                  {{
                    rejected: <span className="text-[20px] font-bold text-red-500">Rejected</span>,
                    finished: <span className={`text-[20px] font-bold ${game.won?.includes(username) ? "text-green-700" : game.won?.includes(game.second_player.name) || game.won?.includes(game.game_starter.name) ? "text-red-500" : "text-gray-700"}`}>{game.won}</span>,
                    pending: game?.second_player?.name === username ? (
                      <>
                        <button
                          onClick={() => changeGameStatus(game._id, "accepted")}
                          className="px-6 py-2 rounded-md text-white bg-blue-600"
                        >Play</button>
                        <button
                          onClick={() => changeGameStatus(game._id, "rejected")}
                          className="px-6 py-2 rounded-md text-white bg-red-600"
                        >Reject</button>
                      </>
                    ) : (
                      <span className="text-[20px] font-bold">Pending...</span>
                    )
                  }[game.status]}
                </div>
              </div>
            ))}
          </div>
        </div>
        <form
          onSubmit={handleSubmit(sendRequest)}
          className="flex mt-3"
        >
          <div className="h-[48px] w-full">
            <input
              type="text"
              placeholder="Enter user's name"
              className={`w-full border-2 px-3 py-2.5 rounded-tl-md rounded-bl-md ${errors.second_player ? "border-red-600" : "border-purple-700"}`}
              {...register("second_player", {
                required: "Please enter player's name",
                minLength: { value: 2, message: "Please enter at least 2 characters :(" },
                maxLength: { value: 100, message: "Please enter less than 100 characters :(" },
              })}
            />
            <div className="flex justify-between pt-4">
              <div>
                <label className={getCaseLabelClassName(watch("case") === "x")}>
                  <input
                    type="radio"
                    value="x"
                    hidden
                    {...register("case", { required: "please select your case" })}
                  />
                  X
                </label>
                <label className={getCaseLabelClassName(watch("case") === "o")}>
                  <input
                    type="radio"
                    value="o"
                    hidden
                    {...register("case", { required: "please select your case" })}
                  />
                  O
                </label>
              </div>
              {errors.second_player?.message && <span className="text-[14px] text-red-600">{errors.second_player.message}</span>}
              {errors.case?.message && <span className="text-[14px] text-red-600">{errors.case.message}</span>}
            </div>
          </div>
          <button
            disabled={loading}
            className="flex items-center gap-3 min-w-max px-4 py-2.5 bg-purple-700 text-white rounded-tr-md rounded-br-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                Sending
                <Spinner />
              </>
            ) : "Send request"}
          </button>
        </form>
      </div>
    </div>
  )
}

const getCaseLabelClassName = isActive => `px-2 py-1 mr-3 border-2 border-purple-700 rounded-md font-bold cursor-pointer ${isActive ? "bg-purple-700 text-white" : "bg-white"}`

export async function getServerSideProps({ req, res }) {
  const data = await fetchGames(getCookie("token", { req, res }));
  console.log(data, "Daaaaaaarrrrrrrata");
  return {
    props: {
      games: data || []
    }
  }
}

