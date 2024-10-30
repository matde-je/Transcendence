const navigate_to = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        {path : "/"}, 
        {path : "/tournament"},
    ];

    const potential_matches = routes.map( route => {
        return {
            route : route,
            isMatch: location.pathname == route.path
        };
    });

    let match = potential_matches.find(potential_match => potential_match.isMatch);
    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

} ;

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", event => {
        if (event.target.matches("[data-link]")) {
            event.preventDefault();
            navigate_to(event.target.href);
        }
    });
    router();
});

