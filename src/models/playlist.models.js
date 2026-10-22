
import mongoose from "mongoose";

const playListSchema = new Schema(
    {
        name: {
            type: String,
            required: true

        },
        description: {
            type: String,
            required: true

        },
        videos: [
            {
                tpye: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        owner:
        {
            tpye: Schema.Types.ObjectId,
            ref: "User"
        }


    }, { timestamps: true }
)

export const Playlist = mongoose.model("Playlist", playListSchema)