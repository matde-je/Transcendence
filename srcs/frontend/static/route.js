const navigate_to = (url) => {
    history.pushState(null, null, url); // push url to history
    router();
};

const router = async () => {
    const routes = [
        {path : "/", elementId: "home"}, 
        {path : "/tournament", elementId: "tournament"},
    ];

    // const potential_matches = routes.map( route => {
    //     return {
    //         route : route,
    //         isMatch: location.pathname == route.path
    //     };
    // });

    // let match = potential_matches.find(potential_match => potential_match.isMatch);
    // if (!match) {
    //     match = {
    //         route: routes[0],
    //         isMatch: true
    //     };
    // }

    const match = routes.find(route => route.path === location.pathname) || routes[0]; // find matching path, if not points to home

    //hide everything
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });
    const matchedElement = document.getElementById(match.elementId);
    if (matchedElement)
        matchedElement.style.display = "block"; // block displays when its set to none

};

//back and forward buttons 
window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", event => { //click on the link
        if (event.target.matches("[data-link]")) { //datalink (home or tournament)
            event.preventDefault();
            navigate_to(event.target.href);
        }
    });
    router();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
    }
});

