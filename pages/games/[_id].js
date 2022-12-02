import { getCookie } from 'cookies-next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { fetchGame, updateGame } from 'utils/functions';
import { BsArrowLeft } from "react-icons/bs";
import { patterns } from 'utils/constants';

export default function GamePlayground({ game: gm }) {
  const [game, setGame] = useState(gm ? JSON.parse(gm) : {});
  const [winner, setWinner] = useState(game?.won);
  const token = getCookie("token");
  const username = getCookie("name");
  const { game_starter, second_player, turn, _id, movements } = game || {};

  const finishGame = async winner => {
    const res = await updateGame(_id, token, { status: "finished", won: winner });
    if (res.data?._id) setWinner(winner);
  }

  const move = async index => {
    if (turn === game_starter?.case && game_starter?.name === username || turn === second_player?.case && second_player?.name === username) {
      const newData = {
        movements: [...movements],
        turn: turn === "x" ? "o" : "x"
      }
      newData.movements[index] = username === game_starter.name ? game_starter.case : second_player.case;

      const res = await updateGame(_id, token, newData);
      if (res.data?._id)
        setGame(res.data);
    }
  }

  const checkWinner = () => {
    patterns.forEach(currPattern => {
      const firstPlayer = movements[currPattern[0]];
      if (firstPlayer === '') return;
      let foundWinningPattern = true;
      currPattern.forEach(idx => {
        if (movements[idx] !== firstPlayer)
          foundWinningPattern = false;
      });

      if (foundWinningPattern && movements[currPattern[0]]) {
        const winner = `${game_starter?.case === movements[currPattern[0]] ? game_starter?.name : second_player?.name} ( ${game.movements[currPattern[0]]} ) is Winner`;
        finishGame(winner);
      } else if (!movements.includes(null)) {
        finishGame("Draw!")
      }
    })
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchGame(_id, token);
      setGame(data)
    }, 5000);

    return () => clearInterval(interval)
  }, [game]);

  useEffect(() => {
    checkWinner()
  }, [game])

  return (
    <div className="custom-container py-20">
      <div className="w-[800px] mx-auto bg-purple-100 px-8 pt-4 pb-16 rounded-xl">
        <h1 className="relative text-[40px] space-x-3 text-center">
          <Link href="/" className='absolute top-0 left-3 text-[20px] text-purple-700'>
            <BsArrowLeft />
          </Link>
          <span><b>{game_starter.name}</b> ( {game_starter.case} )</span>
          <span>vs</span>
          <span><b>{second_player.name}</b> ( {second_player.case} )</span>
        </h1>
        <div className={`relative w-[40%] justify-between gap-y-2 mx-auto flex flex-wrap mt-3`}>
          {movements?.map((movement, i) => (
            <button disabled={movements[i]} onClick={() => move(i)} className='px-3 py-2 w-[32%] h-[70px] rounded-md bg-white text-[40px] text-center cursor-pointer disabled:cursor-not-allowed' key={i}>
              <span>{movement || ""}</span>
            </button>
          ))}
          {winner && <span
            className="absolute w-full h-full top-0 left-0 flex justify-center items-center text-[20px] text-white font-bold"
            style={{
              background: winner.includes(username)
                ? "#3be43b73"
                : winner.includes(game_starter?.name) || winner.includes(second_player?.name)
                  ? "#e43b3b73"
                  : "#39393973"
            }}
          >{winner}</span>}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ req, res, query }) {
  const game = await fetchGame(query?._id, getCookie("token", { req, res }))
  if (!game) return { notFound: true };

  return {
    props: {
      game: JSON.stringify(game)
    }
  }
}
