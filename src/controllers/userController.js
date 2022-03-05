import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

// join
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    req.flash("error", "Password confirmation does not match.");
    return res.status(400).render("join", { pageTitle });
  }
  const existsUsername = await User.exists({ username });
  const existsEmail = await User.exists({ email });
  if (existsUsername) {
    req.flash("error", "This username is already taken.");
    return res.status(400).render("join", { pageTitle });
  }
  if (existsEmail) {
    req.flash("error", "This e-mail is already taken.");
    return res.status(400).render("join", { pageTitle });
  }
  try {
    await User.create({ name, username, email, password, location });
    return res.redirect("/login");
  } catch (error) {
    req.flash("error", error._message);
    return res.status(400).render("join", { pageTitle: "Join" });
  }
};

// login
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    req.flash("error", "An account with this username does not exists.");
    return res.status(400).render("login", { pageTitle });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    req.flash("error", "Wrong password.");
    return res.status(400).render("login", { pageTitle });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

// login github
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

// logout
export const logout = (req, res) => {
  req.flash("info", "Bye Bye");
  req.session.destroy();
  return res.redirect("/");
};

// edit
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl, email: beforeEmail, username: beforeUsername },
    },
    body: { name, email, username, location },
    file,
  } = req;
  let editedParams = [];
  if (beforeUsername !== username) {
    editedParams.push({ username });
  }
  if (beforeEmail !== email) {
    editedParams.push({ email });
  }
  if (editedParams.length > 0) {
    const existingUser = await User.findOne({ $or: editedParams });
    if (existingUser && existingUser._id.toString() !== _id) {
      req.flash("error", "This username/email is already taken.");
      return res.render("edit-profile", { pageTitle: "Edit Profile" });
    }
  }
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

// change password
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "You don't have a password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    req.flash("error", "The current password is incorrect");
    return res
      .status(400)
      .render("users/change-password", { pageTitle: "Change Password" });
  }
  if (newPassword !== newPasswordConfirmation) {
    req.flash("error", "The password does not match the confirmation");
    return res
      .status(400)
      .render("users/change-password", { pageTitle: "Change Password" });
  }
  user.password = newPassword;
  await user.save();
  req.flash("info", "Password Updated");
  return res.redirect("/users/logout");
};

// see
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    req.flash("error", "User not found");
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};
