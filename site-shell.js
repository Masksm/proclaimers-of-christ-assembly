(() => {
  const brand = '<a class="site-brand" href="index.html" aria-label="Proclaimers of Christ Assembly home"><span class="site-brand-mark">✝</span><span class="site-brand-copy">PROCLAIMERS<small>OF CHRIST ASSEMBLY</small></span></a>';
  const header = `
    <div class="site-utility"><div class="site-shell-inner"><span>WELCOME TO PROCLAIMERS OF CHRIST ASSEMBLY</span><div><a href="visit.html">Plan your visit</a><a href="https://www.youtube.com/channel/UCWZyaaodHtEvQ0TF59e7jiQ" target="_blank" rel="noopener">YouTube <span>↗</span></a></div></div></div>
    <header class="site-header site-header-v2"><div class="site-shell-inner site-header-inner">${brand}
      <button class="site-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="site-navigation" aria-label="Main navigation">
        <a class="site-nav-link" href="index.html">Home</a>
        <details class="site-nav-group"><summary>Discover <span>⌄</span></summary><div class="site-dropdown"><a href="about.html"><b>About the church</b><small>Our story, vision and leadership</small></a><a href="visit.html"><b>Plan your visit</b><small>Service information and what to expect</small></a><a href="contact.html"><b>Contact us</b><small>Connect with the church</small></a></div></details>
        <a class="site-nav-link" href="ministries.html">Ministries</a>
        <details class="site-nav-group"><summary>What's on <span>⌄</span></summary><div class="site-dropdown"><a href="events.html"><b>Events & programmes</b><small>Church calendar and upcoming events</small></a><a href="index.html#watch-live"><b>Watch live</b><small>Join a live worship service</small></a></div></details>
        <a class="site-nav-link" href="media.html">Media</a>
        <a class="site-nav-link site-nav-give" href="giving.html">Give</a>
        <a class="site-nav-login" href="login.html">Member sign in <span>↗</span></a>
      </nav>
    </div></header>`;
  const footer = `
    <footer class="site-footer-v2"><div class="site-shell-inner"><div class="site-footer-main"><div class="site-footer-brand">${brand}<p>Proclaiming Christ. Transforming Lives.</p><a class="site-footer-social" href="https://www.youtube.com/channel/UCWZyaaodHtEvQ0TF59e7jiQ" target="_blank" rel="noopener">Watch on YouTube ↗</a></div>
      <div><h3>Discover</h3><a href="about.html">About the church</a><a href="ministries.html">Ministries</a><a href="visit.html">Plan your visit</a><a href="contact.html">Contact</a></div>
      <div><h3>Connect</h3><a href="events.html">Events & programmes</a><a href="media.html">Sermons & media</a><a href="index.html#watch-live">Watch live</a><a href="giving.html">Giving</a></div>
      <div class="site-footer-cta"><span>YOUR NEXT STEP</span><h3>There is a place for you here.</h3><a href="visit.html">Plan a visit <b>→</b></a></div>
    </div><div class="site-footer-bottom"><span>© <span data-current-year></span> Proclaimers of Christ Assembly</span><span>Faith • Hope • Love</span><a href="login.html">Member portal</a></div></div></footer>`;
  document.querySelectorAll("[data-site-header]").forEach(el => el.innerHTML = header);
  document.querySelectorAll("[data-site-footer]").forEach(el => el.innerHTML = footer);
  document.querySelectorAll("[data-current-year]").forEach(el => el.textContent = new Date().getFullYear());
  const toggle=document.querySelector(".site-menu-toggle"), nav=document.querySelector(".site-navigation");
  if(toggle&&nav){toggle.addEventListener("click",()=>{const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(open));});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");}));}
  document.querySelectorAll(".site-nav-group").forEach(group=>group.addEventListener("toggle",()=>{if(group.open)document.querySelectorAll(".site-nav-group").forEach(other=>{if(other!==group)other.open=false;});}));
  const path=location.pathname.split("/").pop()||"index.html";
  document.querySelectorAll(".site-navigation a").forEach(a=>{if(a.getAttribute("href")===path)a.classList.add("is-current");});
  document.addEventListener("click",e=>{if(!e.target.closest(".site-navigation"))document.querySelectorAll(".site-nav-group[open]").forEach(g=>g.open=false);});
})();