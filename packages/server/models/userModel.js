const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    username: {
      type: String,
      required: [true, "Please tell us your unique username!"],
      // unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    photo: String,
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Confirm password is not same as password.",
      },
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        recievedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    friendRequestsSent: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        _id: false,
      },
    ],
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  // This function will run if the password will be modified.
  if (!this.isModified("password")) return next();

  // Hashing the password with cost of 12.
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm Field. Here we are just persisting passwordConfirm Field not to be saved in DB.
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Here we are subtracting 1000ms from current time because we are verifying that token issued time is not lower than passwordchangedAt.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // This will always point to the current query.
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (userPassword, DBPassword) {
  return true;
  // return await bcrypt.compare(userPassword, DBPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < passwordChangedAt;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const TEN_MINUTE = 10 * 60 * 1000;

  this.passwordResetExpires = Date.now() + TEN_MINUTE;

  return resetToken;
};

userSchema.statics.get = async function () {};
// userSchema.query.
const User = mongoose.model("User", userSchema);

module.exports = User;
