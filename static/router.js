import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import AdminLogin from "./components/AdminLogin.js";
import AllServices from './components/AllServices.js'
import AllSections from "./components/AllSections.js";
import ServiceRequests from "./components/ServiceRequests.js";
import ReadService from "./components/ReadService.js";
import SearchResult from "./components/SearchResult.js";
import ViewSection from "./components/ViewSection.js";
import EditService from "./components/EditService.js";
import AdminStat from "./components/AdminStat.js";
import MyRequests from "./components/MyRequests.js";
const routes = [
    {path: "/", component: Home, name: "Home"},
    {path: "/login", component: Login, name: "Login"},
    {path: "/register", component: Register,name:"Register"},
    {path: "/admin-login", component: AdminLogin,name: "AdminLogin"},
    {path: "/services", component: AllServices, name: "AllServices"},
    {path: "/sections", component: AllSections, name: "AllSection"},
    {path: "/requests", component: ServiceRequests, name: "ServiceRequests"},
    {path: "/read/:id", component: ReadService, name: "ReadService"},
    {path: "/section/:id", component: ViewSection, name: "ViewSection"},
    {path: "/edit-service/:id", component: EditService, name: "EditService"},
    {path: "/search-result", component: SearchResult,name:"SearchResult"},
    {path: "/admin-stat", component: AdminStat,name:"AdminStat"},
    {path: "/my-requests", component: MyRequests,name:"MyRequests"},
];

const router = new VueRouter({
    routes,

});

router.beforeEach((to, from, next) => {
    let isLoggedIn = localStorage.getItem("auth-token");
    const loginPages = ["AdminLogin","Register","Login"]
    if(loginPages.includes(to.name)){
        if(isLoggedIn){
            next({name:"Home"})
        }else {
            next()
        }
    }else {
        if(isLoggedIn){
            next()
        }else{
            next({name:"Login"})
        }
    }
    // if (to.name !== "Login" && !localStorage.getItem("auth-token") ? true : false)
    //   next({ name: "Login" });
    // else next();
    // next()
});

export default router;
