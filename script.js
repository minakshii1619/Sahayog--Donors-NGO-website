// ============================================================
// Sahayog — shared front-end behaviour (mock/demo only, no backend)
// ============================================================

// ---- Mobile nav toggle ----
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
});


function currency(n){ return '\u20b9' + n.toLocaleString('en-IN'); }

// ---- NGO directory: search + filter (ngos.html) ----
async function initDirectory(){
  const list =document.getElementById('ngo-list');
  if(!list) return;
  const searchInput =document.getElementById('ngo-search');
  const pills=document.querySelectorAll('.pill-filters button');
  const emptyNote=document.getElementById('empty-note');
  let activeCause='All';
  let NGO_DATA=[];
  try{
    const response =await fetch("http://localhost:5000/api/ngos");
    if(!response.ok){
      throw new Error("Failed to fetch Ngos");
    }
    NGO_DATA= await response.json();
    console.log("Ngos recieved from backend:",NGO_DATA);
  }
  catch(error){
    console.error("Error loading NGOs:",error);
    list.innerHTML="<p>Unable to load NGOs.</p>";
    return;
  }
  

  function render(){
    const q=(searchInput.value || '').toLowerCase().trim();
    const filtered=NGO_DATA.filter(n => {
      const matchesCause=
      activeCause === 'All' || n.cause === activeCause;
      const matchesQuery=
      !q || 
      (n.ngo_name || '').toLowerCase().includes(q)||
      (n.description || '').toLowerCase().includes(q);
    return matchesCause && matchesQuery;
  
    });
    list.innerHTML=filtered.map(n=>`
      <div class="ledger-row">
      <div class="name">
      <a href="ngo-profile.html?id=${n.ngo_id}">
      ${n.ngo_name}
      </a>
      ${
        n.is_verified
        ? '<span class="badge">Verified</span>'
        :'<span class="badge muted">Pending review</span>'
      }
      </div>
      <div class ="meta">
      ${n.city || 'Pune'}
      </div>
      <div class="cause">
      ${n.cause || 'Not specified '}
      </div>
      <a classs="btn ghose small"
      href="ngo-profile.html?id=${n.ngo_id}">
      View Profile
      </a>
      </div>

      `).join('');
      emptyNote.classList.toggle(
        'show',
        filtered.length === 0
      );
  }
  searchInput.addEventListener('input',render);
  pills.forEach(btn => {
    btn.addEventListener('click',() =>{
      pills.forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      activeCause=btn.dataset.cause;
      render();
    });
  });
  render();
}

// ---- NGO profile (ngo-profile.html) ----
async function initNgoProfile(){
  const root=document.getElementById('ngo-profile-root');
  if(!root) return;
  const params= new URLSearchParams(window.location.search);
  const ngoId= params.get('id');
  if(!ngoId){
    root.innerHTML="<p> NGO ID not found.</p>";
    return;
  }
  try{
    const response=await fetch(
      `http://localhost:5000/api/ngos/${ngoId}`
    );
    if(!response.ok){
      throw new Error("NGO not found");
    }
    const ngo=await response.json();
    console.log("Ngo recieved from backend:", ngo);
    document.title=ngo.ngo_name+"-Sahayog";
    //NGO name
    document.getElementById('ngo-name').textContent=
    ngo.ngo_name || "NGO Name";

    //city and cause
    document.getElementById('ngo-meta').textContent=
    `${ngo.city ||'Pune'}. ${ngo.cause || 'Cause not specified'}`;
    //Description
    document.getElementById('ngo-summary').textContent=
    ngo.description || "Ngo description available.";

    //Verification badge
    const badge=document.getElementById('ngo-badge');

    if(ngo.is_verified == 1){
      badge.className= 'badge';
      badge.textContent='Verified';
    }else{
      badge.className='badge muted';
      badge.textContent='Verification pending';
    }
    //official website
    const websiteLink= document.getElementById('ngo-website');
    if(ngo.website && ngo.website.trim() !== ""){
      let website= ngo.website.trim();
      if(
        !website.startsWith("http://")&&
        !website.startsWith("https://")
      ){
        website="https://"+website;
      }
      websiteLink.href=website;
      websiteLink.style.display = "inline-block";
    }else{
      websiteLink.style.display = "none";
    }

    // Campaigns
    const campaignsWrap =
      document.getElementById('ngo-campaigns');

    campaignsWrap.innerHTML =
      '<p style="color:var(--text-soft);font-size:14.5px;padding:20px 0">No live campaigns yet</p>';

  }
  catch(error){
    console.error("Error loading NGO:", error);

    root.innerHTML =
      "<p>Unable to load NGO information.</p>";
  }
}
    
//register ngo
function initNgoRegistration(){
  const ngoForm = document.querySelector('form[data-panel ="ngo"][data-panel-group="register"]');
  if(!ngoForm) return;
  ngoForm.addEventListener("submit", async function(event){
    event.preventDefault();
    let valid=true;
    ngoForm.querySelectorAll("[required]").forEach(function(field){
      const wrap=field.closest(".field");
      if(field.type === "checkbox"){
        if(!field.checked){
          valid=false;
        }
        
      }else{
        if(!field.value.trim()){
          if(wrap){
            wrap.classList.add("invalid");
          }
          valid=false;
        }
        else{
          if(wrap){
            wrap.classList.remove("invalid");
          }
        }
      }
    });
    if(!valid){
      alert("Please fill in all required fields before registering.");
      return;
    }
    const ngoData={
      ngo_name:document.getElementById("n-name").value.trim(),
      registration_number:
      document.getElementById("n-reg").value.trim(),
      darpan_id:
      document.getElementById("n-darpan").value.trim(),
      address:
      document.getElementById("n-address").value.trim(),
      cause:
      document.getElementById("n-cause").value,
      city:
      document.getElementById("n-city").value.trim(),
      description:
      document.getElementById("n-desc").value.trim(),
      email:
      document.getElementById("n-email").value.trim(),
      phone:
      document.getElementById("n-phone").value.trim(),
      password:
      document.getElementById("n-pass").value,
      website:
      document.getElementById("n-website").value.trim()
    };
    console.log("NGO data being sent:",ngoData);
    try{
      const response=await fetch(
        "http://localhost:5000/api/ngos/register",
        {
          method:"POST",
          headers:{
            "Content-type": "application/json"
          },
          body: JSON.stringify(ngoData)
        }
      );
      const data =await response.json();
      console.log("Backend response:",data);
      if(!response.ok){
        throw new Error(data.message || "Registration failed");
        }
        alert("Ngo registerd successfully!");
        ngoForm.reset();
  }
  catch(error){
    console.error("Ngo registration error:", error);
    alert("NGO registration failed:"+error.message);
  }


});
}
//Donor registration
function initDonorRegistration(){
  const donorForm=document.querySelector(
  'form[data-panel="donor"][data-panel-group="register"]'
  );
  if(!donorForm) return;
  donorForm.addEventListener("submit", async function(event){
    console.log("DONOR SUBMIT EVENT FIRED");
    event.preventDefault();
    const donorData={
      name: document.getElementById("d-name").value.trim(),
      phone: document.getElementById("d-phone").value.trim(),
      email:document.getElementById("d-email").value.trim(),
      password: document.getElementById("d-pass").value
    };
    console.log("Donor Data being sent:", donorData);
    try{
      const response= await fetch(
        "http://localhost:5000/api/users/register",
        {
          method:"POST",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify(donorData)
        }
      );
      const data= await response.json();
      console.log("Backend response:", data);
      if(!response.ok){
        throw new Error(
          data.message || "Donor registration failed"
        );
      }
      alert("Donor account created successfully!");
      donorForm.reset();
    }
    catch(error){
      console.error("Donor registration error:", error);
      alert(
        error.message || "Failed to register donor."
      );
    }
  });
}

// ---- Tabs (login.html, register.html) ----
function initTabs(){
  document.querySelectorAll(
    'form[data-panel-group="login"] input[type="email"],'+
    'form[data-panel-group="login"] input[type="password"]'

  ).forEach(input =>{
    input.value ='';
    input.setAttribute('autocomplete','off');
  });
 document.querySelectorAll('.tabs').forEach(tabGroup =>{
  const buttons= tabGroup.querySelectorAll('button');
  buttons.forEach(btn =>{
    btn.addEventListener('click', () =>{
      console.log("LOGIN TAB CLICKED:",btn.dataset.tab);
      //update the active tab
      buttons.forEach(button =>{
        button.classList.remove('active');
        console.log(
          "Tab buttons:",
          
        )
      });
      btn.classList.add('active');
      console.log(
        "Tab buttons:",
                [...buttons].map(button => ({
          name:button.dataset.tab,
          display:getComputedStyle(button).display,
          visibility:getComputedStyle(button).visibility
                }))
     );

      //find all panels belonging to this tab group
      const panels= document.querySelectorAll(
        `[data-panel-group="${tabGroup.dataset.group}"]`
      );
      console.log("Clciked tab:",btn.dataset.tab);
      console.log("Tab bar:",tabGroup);
      console.log("Panels found:",panels.length);
      panels.forEach(panel =>{
        const isSelected=
        panel.dataset.panel === btn.dataset.tab;
        //Show selected form and hide the others
        panel.style.display=isSelected ? 'block' :'none';

        //clear email and password fields when switching tabs
        if(!isSelected){
          panel.querySelectorAll(
            'input[type="email"],input[type="password"]'

          ).forEach(input => {
            input.value='';
          });
          const alertBox= panel.querySelector('.alert');
          if(alertBox){
            alertBox.textContent='';
            alertBox.clasSName='alert';
          }
        }
      });
    });
  });
 });
}

// ---- Generic client-side validation for auth forms ----
function initAuthForms(){
 document.querySelectorAll('form[data-validate]').forEach(form=>{
  if(form.dataset.panelGroup === "register") return;
  form.addEventListener('submit',async function(event){
    event.preventDefault();
    console.log("LOGIN SUBMIT EVENT FIRED");
    const panel= form.dataset.panel;
    const alertBox= form.querySelector('.alert');

    const emailInput=form.querySelector('input[type="email"]');
    const passwordInput =form.querySelector('input[type="password"]');

    const email= emailInput.value.trim();
    const password= passwordInput.value;
    
    if(!email || !password){
      alertBox.className="alert show";
      alertBox.textContent="Please enter both email and password.";
      return;
    }
    try{
      console.log("LOGIN DATA:",{email,role:panel});
      const response = await fetch("http://localhost:5000/api/login",{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email:email,
          password: password,
          role:panel
        })
      });
      const data= await response.json();
      console.log("LOGIN BACKEND RESPONSE:",data);
      if(!response.ok){
        throw new Error(data.message || "LOGIN FAILED.");
      }
      sessionStorage.setItem("user_id",data.user_id);
      sessionStorage.setItem("ngo_id",data.ngo_id);
      if(data.role === "ngo" && data.ngo_id){
        sessionStorage.setItem("ngo_id",data.ngo_id);
      }
    
    alertBox.className= "alert show success";
    alertBox.textContent="Login successfull Redirecting...";
    let dashboard;
    if(data.role === "ngo"){
      dashboard="dashboard-ngo.html";
    }else if(data.role === "donor"){
      dashboard="dashboard-donor.html";
    }else if(data.role === "admin"){
      dashboard="dashboard-admin.html";
    }
    else{
      throw new Error("Unknown account role.");
    }
    console.log("REDIRECTING TO:",dashboard);
    window.location.href= dashboard;

    } catch(error){
      console.error("LOGIN ERROR:",error);
      
      if(alertBox){
        alertBox.className= "alert show";
        alertBox.textContent= error.message || "Unable to log in.";
      }else {
        alert(error.message || "Unable to log in.");
      }
    }
  });
 });
}

// ---- Admin dashboard NGO verification ----
async function initAdminDashboard() {

  const pendingList = document.getElementById("admin-ngo-list");
  const approvedList = document.getElementById("admin-approved-list");

  if (!pendingList && !approvedList) {
    return;
  }

  try {

    const response = await fetch("http://localhost:5000/api/ngos");

    if (!response.ok) {
      throw new Error("Failed to fetch NGOs");
    }

    const ngos = await response.json();

    console.log("NGOs received for admin:", ngos);

    // -----------------------------
    // NGOs awaiting verification
    // -----------------------------

    if (pendingList) {

      const pendingNGOs = ngos.filter(function(ngo) {
        return ngo.is_verified == 0;
      });

      if (pendingNGOs.length === 0) {

        pendingList.innerHTML = `
          <p style="padding:20px;color:var(--text-soft)">
            No NGOs are currently awaiting verification.
          </p>
        `;

      } else {

        pendingList.innerHTML = pendingNGOs.map(function(ngo) {

          return `
            <div class="review-row">

              <div>
                <a
                  href="ngo-profile.html?id=${ngo.ngo_id}"
                  style="font-family:var(--serif);font-size:17px;color:var(--ink)"
                >
                  ${ngo.ngo_name}
                </a>

                <p style="font-size:13px;color:var(--text-soft);margin-top:2px">
                  ${ngo.cause || "Cause not specified"} &middot;
                  ${ngo.city || "Pune"}
                </p>
              </div>

              <div style="font-size:13.5px;color:var(--text-soft)">
                Reg. no. ${ngo.registration_number || "Not available"}
              </div>

              <div style="font-size:13.5px;color:var(--text-soft)">
                DARPAN ID: ${ngo.darpan_id || "Not available"}
              </div>

              <button
                class="btn primary small"
                onclick="verifyNGO(${ngo.ngo_id})"
              >
                Approve
              </button>

              <button 
              class="btn ghost small"
              onclick="visitNGOWebsite('${ngo.website || ""}')"
              >
              Visit Website
              </button>


            </div>
          `;

        }).join("");
      }
    }

    // -----------------------------
    // Already approved NGOs
    // -----------------------------

   if(approvedList){
    const approvedNgos= ngos.filter(function(ngo){
      return ngo.is_verified == 1;
    });
    if(approvedNgos.length === 0){
      approvedList.innerHTML=`
      <tr>
      <td colspan="4">
      No verified NGOs yet.
      </td>
      </tr>
      `;
    }
    else {
      approvedList.innerHTML= approvedNgos.map(function(ngo){
        return `
        <tr>
        <td>
        ${ngo.ngo_name}
        </td>
        <td>
        ${ngo.cause || "Not specified"}
        </td>
        <td>
        ${ngo.created_at
          ? new Date(ngo.created_at).toLocaleDateString("en-IN")
          : "_"
        }
        </td>
        <td>
        Verified
        </td>
        </tr>
        `;
      }).join("");
    }
  }
  } catch(error){
    console.error("Admin NGO loading error:",error);
    if(pendingList){
      pendingList.innerHTML= `
      <p style="padding:20px; color:#b42318">
      Unable to load NGO information.
      </p>
      `;
    }
  }
}
async function verifyNGO(ngoId){
  try{
    const response = await fetch(
      `http://localhost:5000/api/ngos/${ngoId}/verify`,
      {
        method :"PUT"
    
  }
);
const data=await response.json();
if(!response.ok){
  throw new Error(data.message || "Verification failed");
}
alert("Ngo verified successfully!");
initAdminDashboard();
  }
  catch(error){
    console.error("Ngo verification error:",error);
    alert("Failed to verify Ngo. Check the console.");
  }
}
function visitNGOWebsite(website){
  if(!website){
    alert("This ngo has not provided an official website.");
    return;
  }
  let url=website.trim();
  if(!url.startsWith("http://") && !url.startsWith("https://")){
    url="https://"+url;
  }
  window.open(url,"_blank");
}

document.addEventListener('DOMContentLoaded', () => {

  console.log("DOM LOADED");

  initDirectory();
  initNgoProfile();
  initNgoRegistration();
  initTabs();
  initAuthForms();
  initAdminDashboard();

  setTimeout(() => {

    console.log("TRYING DONOR INITIALIZATION");

    initDonorRegistration();

    console.log(
      "DONOR FORM AFTER INITIALIZATION:",
      document.querySelector(
        'form[data-panel="donor"][data-panel-group="register"]'
      )
    );

  }, 500);

});