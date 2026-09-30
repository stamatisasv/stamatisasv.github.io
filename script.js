"use strict";
// ============================================
// DOM REFERENCES
// ============================================
const cursorGlow = document.querySelector(".cursor-glow");
const revealElements = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll('a[href^="#"]');
const projects = document.querySelectorAll(".project");
// ============================================
// CURSOR GLOW
// ============================================
if (cursorGlow) {
    window.addEventListener("mousemove", (event) => {
        cursorGlow.style.left =
            `${event.clientX}px`;
        cursorGlow.style.top =
            `${event.clientY}px`;
        cursorGlow.style.opacity =
            "1";
    });
    window.addEventListener("mouseleave", () => {
        cursorGlow.style.opacity =
            "0";
    });
}
// ============================================
// SCROLL REVEAL
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target
                .classList
                .add("visible");
            revealObserver
                .unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
});
revealElements
    .forEach((element) => {
    revealObserver
        .observe(element);
});
// ============================================
// SMOOTH ANCHOR NAVIGATION
// ============================================
navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId ||
            targetId === "#") {
            return;
        }
        const target = document.querySelector(targetId);
        if (!target) {
            return;
        }
        event.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
// ============================================
// PROJECT POINTER EFFECT
// ============================================
projects.forEach((project) => {
    project.addEventListener("mousemove", (event) => {
        const rect = project
            .getBoundingClientRect();
        const x = event.clientX -
            rect.left;
        const y = event.clientY -
            rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = (x -
            centerX) /
            80;
        const rotateX = (centerY -
            y) /
            100;
        project.style.transform =
            `
          perspective(1500px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(0.992)
          `;
    });
    project.addEventListener("mouseleave", () => {
        project.style.transform =
            "";
    });
});
// ============================================
// ACTIVE NAV SECTION
// ============================================
const sections = document.querySelectorAll("section[id]");
const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }
        const sectionId = entry.target
            .getAttribute("id");
        if (!sectionId) {
            return;
        }
        document
            .querySelectorAll(".nav-links a")
            .forEach((navItem) => {
            const link = navItem;
            const href = link
                .getAttribute("href");
            if (href ===
                `#${sectionId}`) {
                link.style.opacity =
                    "1";
            }
            else {
                link.style.opacity =
                    "";
            }
        });
    });
}, {
    threshold: 0.35
});
sections.forEach((section) => {
    activeObserver
        .observe(section);
});
// ============================================
// PAGE READY
// ============================================
window.addEventListener("load", () => {
    document
        .body
        .classList
        .add("loaded");
});
