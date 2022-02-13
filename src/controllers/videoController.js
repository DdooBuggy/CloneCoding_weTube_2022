export const trending = (req, res) => {
    const videos = [
        {
            title: "First Video",
            rating: 5,
            comments: 2,
            createdAt: "2 minutes ago",
            views: 59,
            id: 1,
        },
        {
            title: "Second Video",
            rating: 3,
            comments: 8,
            createdAt: "24 minutes ago",
            views: 73,
            id: 2,
        },
        {
            title: "First Video",
            rating: 4,
            comments: 29,
            createdAt: "52 minutes ago",
            views: 88,
            id: 3,
        }
    ];
    return res.render("home", {pageTitle:"Home", videos})
};
export const see = (req, res) => res.render("watch", {pageTitle:"Watch Videos"});
export const edit = (req, res) => res.send("Edit");
export const search = (req, res) => res.send("Search Videos");
export const deleteVideo = (req, res) => res.send("Delete Videos");
export const upload = (req, res) => res.send("Upload Videos");