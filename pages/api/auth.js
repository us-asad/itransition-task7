import User from "models/User";
import db from "utils/db";
import jwt from "jsonwebtoken"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(400).send({ message: `Cannot ${req.method}` });

  await db.connect();

  const name = req.body.name;
  if (!name) return res.status(400).send({ message: "Name is required" });

  let user = await User.findOne({ name });

  if (!user) user = await User.create({ name });

  const token = jwt.sign({ name: user.name, _id: user._id }, process.env.JWT_SIGN);

  res.status(200).send({ token, name: user.name });
}