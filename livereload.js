const livereload = require("livereload");
const path = require("path");

// Create a livereload server
const liveReloadServer = livereload.createServer();

// Watch public directory for changes (adjust the path as needed)
liveReloadServer.watch(path.join(__dirname, "public"));

// Optionally, watch views directory if you want to reload on EJS changes
liveReloadServer.watch(path.join(__dirname, "frontend"));


// <!-- frontend/index.ejs -->
// <!DOCTYPE html>
// <html lang="en">
//     <%- include('_partials/header') %>
//     <body>
//         <%- include('_partials/navbar') %>

//         <section class="hero">
//             <!-- Uncomment and use the hero image if needed -->
//             <img class="hero-img" src="/images/hero.jpg" alt="Hero Image" />
//         </section>

//         <section class="main">
//             <%- include('postLayout', { allPosts: allPosts }) %>
//             <%- include('_partials/sidebar') %>
//         </section>

//         <%- include('_partials/footer') %>

//         <!-- JavaScript Files -->
//         <script src="/script.js"></script>
//     </body>
// </html>
