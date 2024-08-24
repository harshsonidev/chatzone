const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const ObjectId = (str = "") => new mongoose.Types.ObjectId(str);

exports.getAllFriends = catchAsync(async (req, res) => {
  const currentUserId = ObjectId(req.user._id);

  const data = await User.findOne({ _id: currentUserId })
    .populate([
      { path: "friends", select: "_id name photo" },
      { path: "friendRequests.sender", select: "name photo" },
    ])
    .select("friends friendRequests");

  // Send Response
  res.status(200).json({
    status: "success",
    data: { friends: data.friends, friendRequests: data.friendRequests },
  });
});

exports.searchFriendsByUsername = catchAsync(async (req, res) => {
  const searchText = req.body.searchText || "";
  let data = [];
  if (!searchText) {
    return res.status(200).json({
      status: "success",
      data: [],
    });
  }

  data = await User.find({
    $or: [
      { name: { $regex: `^${searchText}.*`, $options: "i" } },
      { username: { $regex: `^${searchText}.*`, $options: "i" } },
    ],
  })
    .select("name username photo role")
    .limit(5);

  if (data && data.length > 0) {
    const currentUserId = req.user?._id?.toString();
    const currentFriendsIds = req.user?.friends?.map((el) => el?.toString());
    const currentFriendRequestSentIds =
      req.user?.friendRequestsSent?.map((el) => el?.userId?.toString()) || [];

    const idsToRemove = [currentUserId, ...currentFriendsIds];
    data = data
      .filter((el) => !idsToRemove.includes(el?._id?.toString()))
      ?.map((el) => {
        if (currentFriendRequestSentIds.includes(el?._id?.toString())) {
          return { ...el?._doc, requestAlreadySent: true };
        } else {
          return el;
        }
      });
  }

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getAllFriendRequests = catchAsync(async (req, res) => {
  const data =
    (
      await User.findOne({
        _id: new mongoose.Types.ObjectId(req.user),
      }).populate([
        { path: "friendRequests.sender", select: "name username photo role" },
      ])
    )?.friendRequests?.map((el) => ({
      ...el?.sender?._doc,
      recievedAt: el.recievedAt,
    })) || [];

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = ObjectId(req.user._id);
  const receiverId = ObjectId(req.params.recieverId);

  const isAlreadyFriend = !!(await User.findOne({
    _id: currentUserId,
    friends: receiverId,
  }));

  const isAlreadyRequested = !!(await User.findOne({
    _id: receiverId,
    "friendRequests.sender": currentUserId,
  }));

  if (isAlreadyFriend) {
    return next(new AppError("This user is already your friend.", 400));
  }

  if (req.user._id == req.params.recieverId) {
    return next(new AppError("You can't send request to yourself.", 400));
  }

  if (isAlreadyRequested) {
    return next(new AppError("Request already sent.", 400));
  }

  await User.findByIdAndUpdate(currentUserId, {
    $push: { friendRequestsSent: { userId: receiverId } },
  });

  await User.findByIdAndUpdate(receiverId, {
    $push: { friendRequests: { sender: currentUserId } },
  });

  res.status(200).json({
    status: "success",
    data: receiverId,
    message: "Friend Request Sent!",
  });
});

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = ObjectId(req.user._id);
  const userIdToAccept = ObjectId(req.params.userId);

  const isRequestExist = !!(await User.findOne({
    _id: currentUserId,
    "friendRequests.sender": userIdToAccept,
  }));

  const isAlreadyFriend = !!(await User.findOne({
    _id: currentUserId,
    friends: userIdToAccept,
  }));

  if (isAlreadyFriend) {
    return next(new AppError("This user is already your friend.", 400));
  }

  if (!isRequestExist) {
    return next(
      new AppError("This user is not requested to be your friend.", 400)
    );
  }

  if (req.user._id == req.params.userId) {
    return next(new AppError("You can't become friend of yourself.", 400));
  }

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { friendRequests: { sender: userIdToAccept } },
  });

  await User.findByIdAndUpdate(currentUserId, {
    $push: { friends: userIdToAccept },
  });

  await User.findByIdAndUpdate(userIdToAccept, {
    $pull: { friendRequests: { sender: currentUserId } },
  });

  await User.findByIdAndUpdate(userIdToAccept, {
    $push: { friends: currentUserId },
  });

  await User.findByIdAndUpdate(userIdToAccept, {
    $pull: {
      friendRequestsSent: { userId: currentUserId },
    },
  });

  const userData = await User.findOne({
    _id: userIdToAccept,
  }).select("name username photo role");

  return res.status(200).json({
    status: "success",
    data: userData,
    message: "Request Accepted",
  });
});

exports.rejectFriendRequest = catchAsync(async (req, res, next) => {
  const currentUserId = ObjectId(req.user._id);
  const userIdToReject = ObjectId(req.params.userId);

  const isRequestExist = !!(await User.findOne({
    _id: currentUserId,
    "friendRequests.sender": userIdToReject,
  }));

  const isAlreadyFriend = !!(await User.findOne({
    _id: currentUserId,
    friends: userIdToReject,
  }));

  if (isAlreadyFriend) {
    return next(new AppError("This user is already your friend.", 400));
  }

  if (!isRequestExist) {
    return next(
      new AppError(
        `No friend request to reject with userId: ${userIdToReject}`,
        400
      )
    );
  }

  if (req.user._id == req.params.userId) {
    return next(new AppError("You can't reject yourself.", 400));
  }

  await User.findByIdAndUpdate(currentUserId, {
    $pull: {
      friendRequests: { sender: userIdToReject },
      friendRequestsSent: { userId: userIdToReject },
    },
  });

  await User.findByIdAndUpdate(userIdToReject, {
    $pull: {
      friendRequestsSent: { userId: currentUserId },
    },
  });

  return res.status(200).json({
    status: "success",
    data: userIdToReject,
    message: "Request Rejected",
  });
});
