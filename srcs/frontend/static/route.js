const navigate_to = (url) => {
    if (location.pathname !== url) //push state if URL is different from the current path
        history.pushState(null, null, url);
    router(); // update the display
};

const router = async () => {
    const routes = [
        {path : "/", elementId: "home"}, 
        {path : "/tournament", elementId: "tournament"},
    ];

    const match = routes.find(route => route.path === location.pathname) || routes[0]; // find matching path, if not points to home

    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none"; //hide everything
    });
    const matchedElement = document.getElementById(match.elementId);
    if (matchedElement)
        matchedElement.style.display = "block"; // block displays when its set to none
    if (match.path === "/") {
        init = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
		ani = window.requestAnimationFrame(loop);
    }
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

