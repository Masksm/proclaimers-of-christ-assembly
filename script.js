const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const yearElement = document.querySelector("#year");
if (yearElement) yearElement.textContent = String(new Date().getFullYear());

// Scroll-based reveals, active navigation and compact sticky header.
const revealTargets=document.querySelectorAll("main section, .service-card, .public-event-card, .public-sermon-card, .public-ministry-card");
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window){
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add("section-reveal","is-visible");revealObserver.unobserve(entry.target);}
 }),{threshold:.12,rootMargin:"0px 0px -35px 0px"});
 revealTargets.forEach((el,index)=>{el.classList.add("section-reveal");el.style.transitionDelay=(index%4)*65+"ms";revealObserver.observe(el);});
}
const siteHeader=document.querySelector(".site-header");
const updateHeader=()=>siteHeader?.classList.toggle("scrolled",window.scrollY>24);
window.addEventListener("scroll",updateHeader,{passive:true});updateHeader();
const sectionLinks=[...document.querySelectorAll('.nav-links a[href^="#"]')];
const tracked=[...document.querySelectorAll("main section[id]")];
if("IntersectionObserver" in window){
 const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){sectionLinks.forEach(link=>link.classList.toggle("active",link.getAttribute("href")==="#"+entry.target.id));}
 }),{rootMargin:"-30% 0px -60% 0px"});
 tracked.forEach(section=>navObserver.observe(section));
}
