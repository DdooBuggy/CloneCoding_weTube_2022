export const trending = (req, res) => res.render("home", {pageTitle:"Home"});
export const see = (req, res) => res.render("watch", {pageTitle:"Watch Videos"});
export const edit = (req, res) => res.send("Edit");
export const search = (req, res) => res.send("Search Videos");
export const deleteVideo = (req, res) => res.send("Delete Videos");
export const upload = (req, res) => res.send("Upload Videos");