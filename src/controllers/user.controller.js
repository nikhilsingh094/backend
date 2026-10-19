import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and accesstoken")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validations - like not empty
    // check already user exist:username or email
    // check for images,avatar
    // upload them to cloudinary,avatar
    // create usr Object- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field => field?.trim() === ""))) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exist")
    }


    //     console.log("REQ BODY:", req.body);
    // console.log("REQ FILES:", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;


    const coverImageLocalPath = req.files?.coverImage[0]?.path

    // console.log("Avatar path:", avatarLocalPath);
    // console.log("Cover image path:", coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)


    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    // console.log("Avatar Cloudinary:", avatar);
    // console.log("Cover Cloudinary:", coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while register the user")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    )



})

const loginUser = asyncHandler(async (req, res) => {
    // req body => data
    // username email
    // find user
    // password check
    // access and refresh token
    // send cookie

    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "usernmae or email is required")
    }

    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (!user) {
        throw new ApiError(400, "user does not exit")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).
        json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User loggedIn Successfully")
        )

})


const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
        status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logges out"))

})




export { registerUser, loginUser, logOutUser }