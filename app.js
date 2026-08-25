const departments = ["Cardiology","Neurology","Orthopedics","Pediatrics","Oncology","General Medicine"];
const conditions = ["Arthritis","Diabetes","Hypertension","Obesity","Cancer","Asthma"];
const insuranceProviders = ["Aetna","Blue Cross","Cigna","Medicare","UnitedHealthcare"];
const admissionTypes = ["Emergency","Elective","Urgent"];
const genders = ["Male","Female"];
const doctors = ["Matthew Smith","Samantha Davies","Tiffany Mitchell","Kevin Wells","Kathleen Hanna","Taylor Newton","Kelly Olson","Daniel Ferguson","Heather Day","John Duncan","Douglas Mayo","Kenneth Fletcher"];

let seed = 90210;
function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function pick(a) { return a[Math.floor(rand()*a.length)]; }
function money(n) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n); }
function number(n) { return new Intl.NumberFormat("en-US").format(Math.round(n)); }

function buildData(n=5000) {
  const rows=[];
  for(let i=0;i<n;i++){
    const year=2019+Math.floor(rand()*6);
    const month=Math.floor(rand()*12);
    const day=1+Math.floor(rand()*27);
    const admission=new Date(year,month,day);
    const stay=1+Math.floor(rand()*30);
    const billing=3500+rand()*47000;
    rows.push({
      id:i+1, year, month, gender:pick(genders), admissionType:pick(admissionTypes),
      insurance:pick(insuranceProviders), department:pick(departments),
      condition:pick(conditions), doctor:pick(doctors), billing,
      stay, readmission:rand()<0.145
    });
  }
  return rows;
}
const data=buildData();

const charts={};
const palette=["#2563eb","#0ea5e9","#14b8a6","#8b5cf6","#f59e0b","#ef4444","#64748b","#22c55e"];

function filteredData(){
  const y=document.getElementById("yearFilter").value;
  const g=document.getElementById("genderFilter").value;
  const a=document.getElementById("admissionFilter").value;
  const ins=document.getElementById("insuranceFilter").value;
  return data.filter(r=>
    (y==="all"||String(r.year)===y)&&
    (g==="all"||r.gender===g)&&
    (a==="all"||r.admissionType===a)&&
    (ins==="all"||r.insurance===ins)
  );
}
function groupCount(rows,key){
  const m={}; rows.forEach(r=>m[r[key]]=(m[r[key]]||0)+1); return m;
}
function groupSum(rows,key,value){
  const m={}; rows.forEach(r=>m[r[key]]=(m[r[key]]||0)+r[value]); return m;
}
function destroy(name){ if(charts[name]) charts[name].destroy(); }

const common={
  responsive:true, maintainAspectRatio:false,
  plugins:{legend:{labels:{boxWidth:10,font:{size:10}}},tooltip:{mode:"index",intersect:false}},
  scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{beginAtZero:true,grid:{color:"#eef1f5"},ticks:{font:{size:9}}}}
};

function makeChart(name,id,type,labels,datasets,opts={}){
  destroy(name);
  const ctx=document.getElementById(id);
  charts[name]=new Chart(ctx,{type,data:{labels,datasets},options:{...common,...opts}});
}

function refresh(){
  const rows=filteredData();
  document.getElementById("recordCount").textContent=`${number(rows.length)} records`;
  document.getElementById("totalPatients").textContent=number(rows.length);
  document.getElementById("avgStay").textContent=(rows.reduce((s,r)=>s+r.stay,0)/Math.max(rows.length,1)).toFixed(1);
  document.getElementById("totalBilling").textContent=money(rows.reduce((s,r)=>s+r.billing,0));
  document.getElementById("readmissions").textContent=number(rows.filter(r=>r.readmission).length);

  let m=groupCount(rows,"department");
  let labels=departments, vals=labels.map(x=>m[x]||0);
  makeChart("department","departmentChart","bar",labels,[{label:"Patients",data:vals,backgroundColor:palette[0],borderRadius:5}],{indexAxis:"y"});

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  m={}; rows.forEach(r=>m[r.month]=(m[r.month]||0)+1);
  makeChart("monthly","monthlyChart","line",months,[{label:"Patients",data:months.map((_,i)=>m[i]||0),borderColor:palette[1],backgroundColor:"rgba(14,165,233,.12)",fill:true,tension:.35,pointRadius:2}],{});

  m=groupCount(rows,"admissionType");
  makeChart("admission","admissionChart","doughnut",admissionTypes,[{label:"Patients",data:admissionTypes.map(x=>m[x]||0),backgroundColor:palette.slice(0,3),borderWidth:0}],{plugins:{legend:{position:"bottom",labels:{boxWidth:10,font:{size:9}}}}});

  m=groupSum(rows,"insurance","billing");
  makeChart("insurance","insuranceChart","bar",insuranceProviders,[{label:"Billing",data:insuranceProviders.map(x=>m[x]||0),backgroundColor:palette[2],borderRadius:5}],{scales:{...common.scales,y:{beginAtZero:true,ticks:{font:{size:9},callback:v=>"$"+Math.round(v/1000)+"k"},grid:{color:"#eef1f5"}}}});

  m=groupSum(rows,"department","billing");
  makeChart("deptBilling","deptBillingChart","bar",departments,[{label:"Billing amount",data:departments.map(x=>m[x]||0),backgroundColor:palette[4],borderRadius:5}],{indexAxis:"y",scales:{...common.scales,x:{grid:{color:"#eef1f5"},ticks:{font:{size:9},callback:v=>"$"+Math.round(v/1000)+"k"}}}});

  m=groupCount(rows,"doctor");
  const topDoctors=doctors.map(x=>[x,m[x]||0]).sort((a,b)=>b[1]-a[1]).slice(0,8);
  makeChart("doctor","doctorChart","bar",topDoctors.map(x=>x[0]),[{label:"Patients",data:topDoctors.map(x=>x[1]),backgroundColor:palette[5],borderRadius:5}],{indexAxis:"y"});

  const trendLabels=months;
  const trendDatasets=admissionTypes.map((type,i)=>{
    const arr=Array(12).fill(0);
    rows.forEach(r=>{if(r.admissionType===type)arr[r.month]++;});
    return {label:type,data:arr,borderColor:palette[i],backgroundColor:"transparent",tension:.3,pointRadius:2};
  });
  makeChart("admissionTrend","admissionTrendChart","line",trendLabels,trendDatasets,{});

  m={}; rows.filter(r=>r.readmission).forEach(r=>m[r.department]=(m[r.department]||0)+1);
  makeChart("readmissionDept","readmissionDeptChart","bar",departments,[{label:"Readmissions",data:departments.map(x=>m[x]||0),backgroundColor:palette[3],borderRadius:5}],{});

  m=groupSum(rows,"condition","billing");
  const topCond=conditions.map(x=>[x,m[x]||0]).sort((a,b)=>b[1]-a[1]);
  makeChart("condition","conditionChart","bar",topCond.map(x=>x[0]),[{label:"Billing",data:topCond.map(x=>x[1]),backgroundColor:palette[1],borderRadius:5}],{indexAxis:"y",scales:{...common.scales,x:{grid:{color:"#eef1f5"},ticks:{font:{size:9},callback:v=>"$"+Math.round(v/1000)+"k"}}}});
}

function fillSelect(id, values){
  const el=document.getElementById(id);
  const first=el.options[0];
  el.innerHTML="";
  el.appendChild(first);
  values.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;el.appendChild(o);});
}
fillSelect("yearFilter",[2019,2020,2021,2022,2023,2024]);
fillSelect("genderFilter",genders);
fillSelect("admissionFilter",admissionTypes);
fillSelect("insuranceFilter",insuranceProviders);

["yearFilter","genderFilter","admissionFilter","insuranceFilter"].forEach(id=>document.getElementById(id).addEventListener("change",refresh));
document.getElementById("resetFilters").addEventListener("click",()=>{
  ["yearFilter","genderFilter","admissionFilter","insuranceFilter"].forEach(id=>document.getElementById(id).value="all");
  refresh();
});

document.querySelectorAll(".nav-item").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".page").forEach(x=>x.classList.remove("active-page"));
    document.getElementById(btn.dataset.page==="overview"?"overviewPage":"insightsPage").classList.add("active-page");
    document.getElementById("pageTitle").textContent=btn.dataset.page==="overview"?"Healthcare Overview":"Healthcare Patient Insights";
    document.getElementById("pageSubtitle").textContent=btn.dataset.page==="overview"?"Hospital admissions, patients and billing performance":"Department, doctor, condition and readmission analysis";
    setTimeout(()=>{Object.values(charts).forEach(c=>c.resize());},50);
  });
});

refresh();
