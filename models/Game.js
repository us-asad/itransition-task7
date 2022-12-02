import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  game_starter: {
    name: {
      type: String,
      required: true,
    },
    case: {
      type: String,
      required: true,
      enum: ["x", "o"]
    }
  },
  second_player: {
    name: {
      type: String,
      required: true,
    },
    case: {
      type: String,
      required: true,
      enum: ["x", "o"]
    }
  },
  movements: {
    type: Array,
    required: true,
    default: [...new Array(9)].map(() => null)
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "rejected", "finished"]
  },
  next_mover: {
    type: String,
    required: true
  },
  won: String,
  turn: {
    type: "String",
    default: "x",
    enum: ["x", "o"]
  }
}, {
  timestamps: true,
});

const Game = mongoose.models?.Game || mongoose.model("Game", gameSchema);

export default Game;