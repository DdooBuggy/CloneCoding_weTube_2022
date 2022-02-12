export const join = (req, res) => res.send("Join");
export const edit = (req, res) => res.render("edit", {pageTitle:"Edit User"});
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Login Page");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");