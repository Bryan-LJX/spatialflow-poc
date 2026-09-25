/**
 * marketing-scene.js — presentation layer only (redesign-threejs-planner-split,
 * design.md Decision 5). Only reads scroll/intersection signals and toggles
 * classes/canvas pixels on marketing-shell nodes; never reads or writes
 * `state`/`Layout` (there is none on this page after the planner split).
 * See docs/site/ARCHITECTURE.md §10.
 *
 * Replaces the old rAF-driven initHeroZoom/initScrollReveal with GSAP
 * ScrollTrigger timelines, smoothed by Lenis. initAccordion/initNavContrast
 * stay plain vanilla JS inline in index.html — neither needs this stack.
 */

import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

var prefersReducedMotion = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Lenis smooth scroll, ticked from GSAP's ticker and kept in sync with
 * ScrollTrigger's scroll-position math (the documented Lenis+GSAP
 * integration). Skipped entirely under prefers-reduced-motion — native
 * scroll instead.
 */
function initLenis() {
  if (prefersReducedMotion) return;
  // autoRaf: false — Lenis must NOT run its own rAF loop here. It is ticked
  // from gsap.ticker below instead, so GSAP/ScrollTrigger and Lenis agree on
  // scroll position every frame. Leaving Lenis's default raf loop running
  // alongside gsap.ticker double-drives scroll updates and desyncs
  // ScrollTrigger's pinned elements from the rest of the page.
  var lenis = new Lenis({ autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/**
 * initScrollReveal — replaces the old IntersectionObserver with
 * ScrollTrigger-driven reveals on the same [data-reveal] markup contract:
 * one-shot, same prefers-reduced-motion "reveal everything immediately"
 * behavior as before.
 */
function initScrollReveal() {
  var nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) return;

  if (prefersReducedMotion) {
    nodes.forEach(function (n) { n.classList.add("is-revealed"); });
    return;
  }

  nodes.forEach(function (n) {
    ScrollTrigger.create({
      trigger: n,
      start: "top 85%",
      once: true,
      onEnter: function () { n.classList.add("is-revealed"); }
    });
  });
}

function supportsWebGL() {
  try {
    var canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

/**
 * Hero scroll-through: pins the hero and scrubs the portal's scale/opacity
 * over its scroll range — the direct GSAP/ScrollTrigger replacement for the
 * old rAF-driven initHeroZoom, and also the WebGL-unavailable fallback
 * treatment (same visual effect, no 3D). Returns a `getProgress` accessor
 * the WebGL scene reads to stay in sync, or null under reduced motion.
 */
function initHeroScrub(hero, portal) {
  if (prefersReducedMotion) return null;
  var progress = 0;
  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=65%",
    pin: true,
    scrub: true,
    onUpdate: function (self) {
      progress = self.progress;
      gsap.set(portal, {
        scale: 1 + progress * 1.6,
        opacity: 1 - progress * 0.9
      });
    }
  });
  return function () { return progress; };
}

/**
 * WebGL depth layer — a small cluster of brand-colored blocks floating in
 * front of the portal photo, camera dollying forward as `getProgress` moves
 * 0 → 1 (the real WebGL depth jeskojets.com's window-to-clouds transition
 * uses, vs. the old flat CSS scale/fade). Feature-detected; entirely
 * skipped when WebGL is unavailable, leaving the existing portal <img> as
 * the only visible layer (design.md Decision 5's fallback).
 */
function initHeroScene(portal, getProgress) {
  if (!supportsWebGL()) return;

  var label = portal.querySelector("span");
  var canvas = document.createElement("canvas");
  canvas.id = "hero-canvas";
  canvas.className = "absolute inset-0 w-full h-full pointer-events-none";
  portal.insertBefore(canvas, label);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  scene.add(new THREE.AmbientLight(0x6b5342, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);

  var group = new THREE.Group();
  scene.add(group);

  var palette = [0xbf8c56, 0x8c5a32, 0xe3cba8, 0xd1ab7a];
  var blockGeo = new THREE.BoxGeometry(1, 1, 1);
  for (var i = 0; i < 9; i++) {
    var mesh = new THREE.Mesh(blockGeo, new THREE.MeshStandardMaterial({
      color: palette[i % palette.length], roughness: 0.6, metalness: 0.1
    }));
    var radius = 2.4 + (i % 3) * 0.6;
    var angle = (i / 9) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, ((i % 3) - 1) * 1.4, Math.sin(angle) * radius - 2);
    var s = 0.5 + (i % 3) * 0.25;
    mesh.scale.set(s, s, s);
    mesh.rotation.set(angle * 0.6, angle, 0);
    group.add(mesh);
  }

  function resize() {
    var w = portal.clientWidth, h = portal.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  if (!getProgress) {
    // prefers-reduced-motion: one static frame, no render loop, no dolly.
    renderer.render(scene, camera);
    return;
  }

  // Only render while the hero is actually on screen — once the visitor has
  // scrolled past it, an endless per-frame render loop just burns CPU/battery
  // (and, in constrained environments, competes with the compositor for no
  // visible benefit) for a canvas nobody can see.
  var visible = true;
  var hero = portal.closest("section");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) requestAnimationFrame(renderFrame);
    }).observe(hero);
  }

  var clock = new THREE.Clock();
  function renderFrame() {
    if (!visible) return;
    var t = clock.getElapsedTime();
    var progress = getProgress();
    group.rotation.y = t * 0.12 + progress * 1.4;
    camera.position.z = 8 - progress * 5.5;
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}

function initHero() {
  var portal = document.querySelector(".hero-portal");
  var hero = portal && portal.closest("section");
  if (!portal || !hero) return;
  var getProgress = initHeroScrub(hero, portal);
  initHeroScene(portal, getProgress);
}

initLenis();
initScrollReveal();
initHero();
