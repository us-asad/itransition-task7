import db from "utils/db";
import jwt from "jsonwebtoken"
import Game from "models/Game";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(400).send({ message: `Cannot ${req.method}` });

  await db.connect();

  const data = req.body;
  if (!data.second_player || !data.game_starter_case) return res.status(400).send({ message: "Validation error" });

  const verified = jwt.verify(req.headers.authorization?.split(" ")[1], process.env.JWT_SIGN);
  if (!verified?.name) return res.status(403).send({ message: "Access deined" });

  const newGame = await Game.create({
    second_player: {
      name: data.second_player,
      case: data.game_starter_case === "x" ? "o" : "x",
    },
    game_starter: {
      name: verified.name,
      case: data.game_starter_case
    },
    next_mover: verified.name
  });

  res.status(200).send(newGame);
}