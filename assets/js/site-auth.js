/**
 * site-auth.js — shared identity/session module (redesign-threejs-planner-split,
 * design.md Decision 2). index.html and planner.html both import this directly
 * via native <script type="module">, so there is exactly one copy of the
 * signUp/signIn/signOut Trm and the currentUser race-condition fix from
 * add-user-auth-persistence, instead of two copies that could drift.
 *
 * getCurrentUser/onAuthChange are the port planner.html's layoutStore reads
 * identity through (design.md Decision 3) — layoutStore itself, and the
 * saveLayoutForUser/loadLayoutForUser Trm it drives, stay in planner.html.
 */

var supabaseClient = (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY)
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  : null;

var currentUser = null;
var listeners = [];

function notify() {
  listeners.forEach(function (fn) { fn(currentUser); });
}

/** signUp : (email, password) -> User (Trm, partial: fails on duplicate/weak password) */
export function signUp(email, password) {
  if (!supabaseClient) return Promise.reject(new Error("Auth is not configured."));
  return supabaseClient.auth.signUp({ email: email, password: password }).then(function (res) {
    if (res.error) throw res.error;
    currentUser = res.data.user;
    notify();
    return currentUser;
  });
}

/** signIn : (email, password) -> User (Trm, partial: fails on bad credentials) */
export function signIn(email, password) {
  if (!supabaseClient) return Promise.reject(new Error("Auth is not configured."));
  return supabaseClient.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
    if (res.error) throw res.error;
    currentUser = res.data.user;
    notify();
    return currentUser;
  });
}

/** signOut : User -> () (Trm, total) */
export function signOut() {
  if (!supabaseClient) { currentUser = null; notify(); return Promise.resolve(); }
  return supabaseClient.auth.signOut().then(function () {
    currentUser = null;
    notify();
  });
}

/** getCurrentUser : () -> User | null */
export function getCurrentUser() {
  return currentUser;
}

/**
 * getSupabaseClient : () -> SupabaseClient | null
 * planner.html's saveLayoutForUser/loadLayoutForUser (Trm to the `layouts`
 * table) reuse this same client for their .from() calls instead of creating
 * a second one. The Supabase JS SDK spins up a GoTrueClient — and starts
 * managing the shared auth-token storage key — on every createClient() call
 * even when a caller only ever touches .from(), so two independent clients
 * on one page trigger the SDK's own "Multiple GoTrueClient instances"
 * warning and the undefined session behavior it warns about. One client,
 * shared, keeps identity and storage-key ownership singular.
 */
export function getSupabaseClient() {
  return supabaseClient;
}

/**
 * onAuthChange : (User|null -> ()) -> ()
 * Fires whenever currentUser changes: the one-time INITIAL_SESSION restore
 * on load, and after every signUp/signIn/signOut. planner.html registers a
 * listener here to reload the right layout (layoutStore.load()) whenever
 * identity changes, replacing the direct bootLayout() calls the old
 * single-page version made from inside each auth handler.
 */
export function onAuthChange(fn) {
  listeners.push(fn);
}

if (supabaseClient) {
  /* Only drives the one-time initial session restore. Interactive
   * signUp/signIn/signOut above set currentUser synchronously themselves, so
   * a save immediately after signing in can never race an async auth event
   * and land in the wrong store — the fix from add-user-auth-persistence,
   * preserved verbatim and now centralized here instead of duplicated per
   * page. */
  supabaseClient.auth.onAuthStateChange(function (event, session) {
    if (event === "INITIAL_SESSION") {
      currentUser = session ? session.user : null;
      notify();
    }
  });
} else {
  // No Supabase configured — still notify once so consumers boot the signed-out path.
  setTimeout(notify, 0);
}

/**
 * renderAuthNav — wires the nav auth widget inside navRootEl (#auth-widget's
 * signed-out/signed-in buttons) and the shared auth modal (#auth-modal and
 * its form). The modal is page-level markup outside the nav on both pages
 * (an accepted duplicated-markup gap — design.md Risks), so it is queried
 * from `document` rather than scoped to navRootEl.
 */
export function renderAuthNav(navRootEl) {
  var authSignedOutEl = navRootEl.querySelector("#auth-signed-out");
  var authSignedInEl = navRootEl.querySelector("#auth-signed-in");
  var authUserEmailEl = navRootEl.querySelector("#auth-user-email");

  var authModalEl = document.getElementById("auth-modal");
  var authFormEl = document.getElementById("auth-form");
  var authEmailEl = document.getElementById("auth-email");
  var authPasswordEl = document.getElementById("auth-password");
  var authErrorEl = document.getElementById("auth-error");
  var authInfoEl = document.getElementById("auth-info");
  var authSubmitEl = document.getElementById("btn-auth-submit");
  var authMode = "signin";

  function updateAuthUI() {
    if (currentUser) {
      authSignedOutEl.classList.add("hidden");
      authSignedInEl.classList.remove("hidden");
      authSignedInEl.classList.add("flex");
      authUserEmailEl.textContent = currentUser.email;
    } else {
      authSignedOutEl.classList.remove("hidden");
      authSignedInEl.classList.add("hidden");
      authSignedInEl.classList.remove("flex");
    }
  }

  function renderAuthModalMode() {
    var isSignUp = authMode === "signup";
    document.getElementById("auth-modal-title").textContent = isSignUp ? "Sign up" : "Sign in";
    authSubmitEl.textContent = isSignUp ? "Sign Up" : "Sign In";
    document.getElementById("auth-toggle-prompt").textContent =
      isSignUp ? "Already have an account?" : "Don't have an account?";
    document.getElementById("btn-auth-toggle-mode").textContent = isSignUp ? "Sign in" : "Sign up";
    authPasswordEl.setAttribute("autocomplete", isSignUp ? "new-password" : "current-password");
  }

  function openAuthModal(mode) {
    authMode = mode;
    renderAuthModalMode();
    authErrorEl.classList.add("hidden");
    authInfoEl.classList.add("hidden");
    authFormEl.reset();
    authModalEl.classList.remove("hidden");
    authModalEl.classList.add("is-open");
    authEmailEl.focus();
  }

  function closeAuthModal() {
    authModalEl.classList.add("hidden");
    authModalEl.classList.remove("is-open");
  }

  navRootEl.querySelector("#btn-nav-signin").addEventListener("click", function () { openAuthModal("signin"); });
  navRootEl.querySelector("#btn-nav-signup").addEventListener("click", function () { openAuthModal("signup"); });
  navRootEl.querySelector("#btn-nav-signout").addEventListener("click", function () { signOut(); });
  document.getElementById("btn-auth-modal-close").addEventListener("click", closeAuthModal);
  document.getElementById("auth-modal-backdrop").addEventListener("click", closeAuthModal);
  document.getElementById("btn-auth-toggle-mode").addEventListener("click", function () {
    openAuthModal(authMode === "signup" ? "signin" : "signup");
  });

  authFormEl.addEventListener("submit", function (ev) {
    ev.preventDefault();
    authErrorEl.classList.add("hidden");
    authInfoEl.classList.add("hidden");
    authSubmitEl.setAttribute("disabled", "disabled");

    var email = authEmailEl.value.trim();
    var password = authPasswordEl.value;
    var action = authMode === "signup" ? signUp(email, password) : signIn(email, password);

    action.then(function () {
      authSubmitEl.removeAttribute("disabled");
      if (authMode === "signup") {
        authInfoEl.textContent = "Account created. You're signed in.";
        authInfoEl.classList.remove("hidden");
        setTimeout(closeAuthModal, 900);
      } else {
        closeAuthModal();
      }
    }).catch(function (err) {
      authSubmitEl.removeAttribute("disabled");
      authErrorEl.textContent = (err && err.message) ||
        (authMode === "signup" ? "Couldn't create that account." : "Incorrect email or password.");
      authErrorEl.classList.remove("hidden");
    });
  });

  onAuthChange(updateAuthUI);
  updateAuthUI();
}
