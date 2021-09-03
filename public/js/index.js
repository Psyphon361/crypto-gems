let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

document.getElementById("logo").style.display = "none";

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
});


// following are the code to change sidebar button(optional)
function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the icons class
        document.getElementById("logo").style.display = "block";
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");//replacing the icons class
        document.getElementById("logo").style.display = "none";
    }
}
