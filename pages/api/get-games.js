import db from "utils/db";
import jwt from "jsonwebtoken"
import Game from "models/Game";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(400).send({ message: `Cannot ${req.method}` });

  await db.connect();

  const verified = jwt.verify(req.headers.authorization?.split(" ")[1], process.env.JWT_SIGN);
  if (!verified?.name) return res.status(403).send({ message: "Access deined" });

  const startedGames = await Game.find({ ["game_starter.name"]: verified.name }).exec();
  const playedGames = await Game.find({ ["second_player.name"]: verified.name }).exec();
  const sortedAllGames = JSON.stringify([...startedGames, ...playedGames].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

  res.status(200).send(sortedAllGames);
}