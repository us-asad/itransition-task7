import db from "utils/db";
import jwt from "jsonwebtoken"
import Game from "models/Game";
import { isValidObjectId } from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(400).send({ message: `Cannot ${req.method}` });

  await db.connect();

  const verified = jwt.verify(req.headers.authorization?.split(" ")[1], process.env.JWT_SIGN);
  if (!verified?.name) return res.status(403).send({ message: "Access deined" });
  
  if (!isValidObjectId(req.query._id)) return res.status(400).send({ message: "Bad id format" });

  const game = await Game.findByIdAndUpdate(req.query._id, req.body,{ new: true });
  if (!game) return res.status(404).send({ message: "User not found" });

  res.status(200).send(game);
}