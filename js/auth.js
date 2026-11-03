(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const loginForm = $("#login-form"), signupForm = $("#signup-form"), message = $("#auth-message");
  const showMessage = (text, type="success") => { message.textContent=text; message.className=`notice notice-${type}`; };
  const hideMessage = () => { message.textContent=""; message.className="notice hidden"; };
  const setMode = mode => {
    hideMessage();
    const signup = mode === "signup";
    loginForm.classList.toggle("hidden", signup); signupForm.classList.toggle("hidden", !signup);
    document.querySelectorAll("[data-auth-tab]").forEach(b=>b.classList.toggle("active", b.dataset.authTab===mode));
  };
  document.querySelectorAll("[data-auth-tab]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.authTab)));
  document.querySelectorAll("[data-switch]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.switch)));
  document.querySelectorAll(".show-password").forEach(btn=>btn.addEventListener("click",()=>{
    const input=btn.parentElement.querySelector("input"); input.type=input.type==="password"?"text":"password"; btn.textContent=input.type==="password"?"Show":"Hide";
  }));
  signupForm.addEventListener("submit", e=>{
    e.preventDefault(); hideMessage();
    const data = new FormData(signupForm), name=String(data.get("name")||"").trim(), email=String(data.get("email")||"").trim().toLowerCase();
    const phone=String(data.get("phone")||"").trim(), password=String(data.get("password")||""), confirm=String(data.get("confirmPassword")||"");
    if(name.length<2){showMessage("Please enter your full name.","error");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showMessage("Enter a valid email address.","error");return;}
    if(!/^[6-9]\d{9}$/.test(phone)){showMessage("Enter a valid 10-digit Indian mobile number.","error");return;}
    if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)){showMessage("Password needs 8+ characters, uppercase, lowercase, a number and a symbol.","error");return;}
    if(password!==confirm){showMessage("Passwords do not match.","error");return;}
    if(!data.get("terms")){showMessage("Please accept the demo terms to continue.","error");return;}
    const users=JSON.parse(localStorage.getItem("tripnova_users")||"[]");
    if(users.some(u=>u.email===email)){showMessage("An account with this email already exists. Please log in.","error");return;}
    users.push({name,email,phone,password,createdAt:new Date().toISOString()});
    localStorage.setItem("tripnova_users",JSON.stringify(users));
    signupForm.reset(); setMode("login"); showMessage("Account created successfully! Please log in.","success");
    loginForm.elements.email.value=email; loginForm.elements.password.focus();
  });
  loginForm.addEventListener("submit", e=>{
    e.preventDefault(); hideMessage();
    const email=String(new FormData(loginForm).get("email")||"").trim().toLowerCase(), password=String(new FormData(loginForm).get("password")||"");
    const users=JSON.parse(localStorage.getItem("tripnova_users")||"[]");
    const user=users.find(u=>u.email===email&&u.password===password);
    if(!user){showMessage("Email or password is incorrect. If you're new, create an account first.","error");return;}
    localStorage.setItem("tripnova_session",JSON.stringify({email:user.email,name:user.name,loginAt:new Date().toISOString()}));
    location.href="home.html";
  });
  $("#forgot-password").addEventListener("click",()=>showMessage("Password reset is a UI demo. For this project, create a new account with a different email if needed.","info"));
  if(new URLSearchParams(location.search).get("created")==="1") showMessage("Account created successfully! Please log in.","success");
})();