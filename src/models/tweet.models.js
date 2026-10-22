
import mongoose from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true

        },
       
        owner:
        {
            tpye: Schema.Types.ObjectId,
            ref: "User"
        }


    }, { timestamps: true }
)

export const Tweet = mongoose.model("Tweet", tweetSchema)