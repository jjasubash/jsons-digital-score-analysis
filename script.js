// JSONS Digital Score Analysis Software
// Set APPS_SCRIPT_URL to your deployed Google Apps Script web-app /exec URL.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzr9YNxs8yULS_N-E3GHh4K5dSpVk1dcuxDXHBfI54AqSUAp9TtKrdNlsh4dapSkhxc/exec";
const WHATSAPP_NUMBER = "918610817060";

const form = document.getElementById("auditForm");
const submitBtn = document.getElementById("submitBtn");
const results = document.getElementById("results");
const toast = document.getElementById("toast");

document.getElementById("year").textContent = new Date().getFullYear();

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(()=>toast.classList.remove("show"), 3600);
}

function wireUpload(inputId, nameId){
  const input = document.getElementById(inputId);
  const name = document.getElementById(nameId);
  input.addEventListener("change", ()=>{
    const file = input.files[0];
    name.textContent = file ? file.name : "PNG, JPG or WEBP";
    input.closest(".upload-box").classList.toggle("has-file", !!file);
  });
}
wireUpload("gmb","gmbName");
wireUpload("instagram","instagramName");

function fileToPayload(file){
  return new Promise((resolve,reject)=>{
    if(!file) return reject(new Error("Missing image"));
    const reader = new FileReader();
    reader.onload = ()=> {
      const result = String(reader.result);
      resolve({
        name:file.name,
        mimeType:file.type || "image/jpeg",
        data:result.split(",")[1]
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setResultBlock(prefix, data){
  const score = Math.max(0, Math.min(50, Number(data.score || 0)));
  document.getElementById(prefix + "Score").textContent = score;
  document.getElementById(prefix + "Progress").style.width = `${score * 2}%`;
  document.getElementById(prefix + "Summary").textContent = data.summary || "";
  const list = document.getElementById(prefix + "Gist");
  list.innerHTML = "";
  (data.gist || []).slice(0,4).forEach(item=>{
    const el = document.createElement("div");
    el.className = "gist-item";
    el.textContent = item;
    list.appendChild(el);
  });
}

function showResults(data){
  const overall = Math.max(0, Math.min(100, Number(data.overallScore || 0)));
  document.getElementById("overallScore").textContent = overall;
  document.getElementById("resultTitle").textContent =
    data.headline || (overall < 75 ? "Your profile needs improvement." : "Your profile is on the right track.");
  document.getElementById("resultIntro").textContent =
    data.clientIntro || "Based on the visible signals in your submitted screenshots.";

  setResultBlock("gmb", data.gmb || {});
  setResultBlock("instagram", data.instagram || {});

  results.classList.remove("hidden");
  results.scrollIntoView({behavior:"smooth", block:"start"});
}

form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  if(APPS_SCRIPT_URL.includes("PASTE_YOUR")){
    showToast("Connect the Google Apps Script URL in script.js first.");
    return;
  }

  const gmbFile = document.getElementById("gmb").files[0];
  const instaFile = document.getElementById("instagram").files[0];

  submitBtn.disabled = true;
  submitBtn.querySelector("span").textContent = "ANALYZING…";

  try{
    const [gmb, instagram] = await Promise.all([
      fileToPayload(gmbFile),
      fileToPayload(instaFile)
    ]);

    const payload = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      place: document.getElementById("place").value.trim(),
      email: document.getElementById("email").value.trim(),
      gmb,
      instagram,
      source: window.location.href,
      submittedAt: new Date().toISOString()
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method:"POST",
      redirect:"follow",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload)
    });

    const raw = await response.text();
    let data;
    try{ data = JSON.parse(raw); }catch{
      throw new Error("The analysis service returned an unexpected response.");
    }
    if(!data.ok) throw new Error(data.error || "Analysis failed.");

    showResults(data.analysis);
    showToast("Analysis complete.");
  }catch(err){
    console.error(err);
    showToast(err.message || "Something went wrong. Please try again.");
  }finally{
    submitBtn.disabled = false;
    submitBtn.querySelector("span").textContent = "START TEST";
  }
});

document.getElementById("resetBtn").addEventListener("click", ()=>{
  results.classList.add("hidden");
  form.reset();
  document.querySelectorAll(".upload-box").forEach(x=>x.classList.remove("has-file"));
  document.getElementById("gmbName").textContent = "PNG, JPG or WEBP";
  document.getElementById("instagramName").textContent = "PNG, JPG or WEBP";
  window.scrollTo({top:0, behavior:"smooth"});
});

document.getElementById("whatsappBtn").href =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi JSONS Branding Studio, I completed the Digital Score Analysis and would like help improving my profile.")}`;
