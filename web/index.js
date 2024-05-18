var token = null;
var dataset = [];
var datablob = {};
var count = null;
var requests = 0;
var interval = 10000;

async function login() {
  $("#login-input").removeClass("pdb-input-error");
  $("#login-label").hide();
  const token = $("#login-input").val().trim().replaceAll(" ", "");
  if(/[^0-9a-f]/gi.test(token) || token.length == 0) {
    $("#login-input").addClass("pdb-input-error");
    $("#login-label-title").text("Invalid database token");
    $("#login-label").show();
    return;
  }
  $("#login-spinner").show();
  $("#login-btn-login, #login-btn-new, #login-input").prop("disabled", true);
  try {
    const f = await fetch(`https://pocketdb-api.vercel.app/get?key=main&token=${token}`);
    const res = await f.json();
    if(!res.success && res.message.includes("ACCESS_TOKEN_INVALID")) {
      $("#login-input").addClass("pdb-input-error");
      $("#login-label-title").text("Database does not exist");
      $("#login-label").show();
      $("#login-spinner").hide();
      requests++;
      if(requests > 5) {
        $("#security-alert").show();
        return unblock();
      }
      $("#login-btn-login, #login-btn-new, #login-input").prop("disabled", false);
      return;
    }
    window.token = token;
    window.dataset = res.result.list;
    window.datablob = {};
    window.count = dataset.length;
    const init = await initialize();
    if(init == false) {
      $("#login-input").addClass("pdb-input-error");
      $("#login-label-title").text("Can't connect to the server");
      $("#login-label").show();
      $("#login-spinner").hide();
      $("#security-alert").show();
      unblock();
      return;
    }
    refresh();
    $("#login-page").hide();
    $("#dashboard-page").show();
  } catch(e) {
    console.error(e);
    $("#login-input").addClass("pdb-input-error");
    $("#login-label-title").text("Can't connect to the server");
    $("#login-label").show();
    $("#login-spinner").hide();
    $("#login-btn-login, #login-btn-new, #login-input").prop("disabled", false);
    return;
  }
}

async function initialize() {
  window.requests = 0;
  for(let i = 0; i < dataset.length; i++) {
    let key = dataset[i];
    try {
      const f = await fetch(`https://pocketdb-api.vercel.app/get?key=${key}&token=${token}`);
      const res = await f.json();
      if(!res.success) return false;
      const val = res.result.data;
      window.datablob[key] = {
        value: val,
        sample: typeof val == "object" ? getObjectSample(val) : getEllipsis(val, 100),
        size: getByteSize(val),
        type: getDataType(val)
      }
    } catch(e) {
      console.error(e);
      return false;
    }
  }
  window.onbeforeunload = _ => true;
  return true;
}

function getByteSize(raw) {
  const encoded = new TextEncoder().encode(raw);
  const bytes = encoded.length;
  const size = bytes / 1024;
  if(size > 1) return "1+";
  return size.toFixed(2);
}

function getEllipsis(raw, size) {
  if(raw == null) return "";
  if(JSON.stringify(raw).length < size) return typeof raw == "string" ? `"${raw}"` : raw;
  const res = raw.toString().substr(0, size - 3) + "...";
  console.log(typeof raw, raw);
  if(typeof raw == "string") return `"${res}"`;
  return res;
}

function getObjectSample(data) {
  if(data == null) return "null";
  if(Array.isArray(data)) {
    let raw = data.length == 0 ? null : data.slice(0, 7).map(i => `"${getEllipsis(i, 20)}"`).join(", ");
    return `[ ${raw || "Empty"} ]`;
  }
  const raw = Object.keys(data).slice(0, 7).map(i => getEllipsis(i, 20)).join(", ");
  return `{ ${raw || "Empty"} }`;
}

function getDataType(raw) {
  if(raw == null) return "Null";
  let type = Array.isArray(raw) ? "Array" : typeof raw;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function refresh() {
  $("#dashboard-count").text(count);
  $("#dashboard-token").text(token);
  let html = "";
  for(let key in datablob) {
    let data = datablob[key];
    html += `<div class="card pdb-card m-4"><div class="card-body p-0"><div class="d-flex justify-content-between p-3 align-items-center"><p class="m-0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" opacity="0.5"><path d="m10.41.24 4.711 2.774c.544.316.878.897.879 1.526v5.01a1.77 1.77 0 0 1-.88 1.53l-7.753 4.521-.002.001a1.769 1.769 0 0 1-1.774 0H5.59L.873 12.85A1.761 1.761 0 0 1 0 11.327V6.292c0-.304.078-.598.22-.855l.004-.005.01-.019c.15-.262.369-.486.64-.643L8.641.239a1.752 1.752 0 0 1 1.765 0l.002.001ZM9.397 1.534l-7.17 4.182 4.116 2.388a.27.27 0 0 0 .269 0l7.152-4.148-4.115-2.422a.252.252 0 0 0-.252 0Zm-7.768 10.02 4.1 2.393V9.474a1.807 1.807 0 0 1-.138-.072L1.5 7.029v4.298c0 .095.05.181.129.227Zm8.6.642 1.521-.887v-4.45l-1.521.882ZM7.365 9.402h.001c-.044.026-.09.049-.136.071v4.472l1.5-.875V8.61Zm5.885 1.032 1.115-.65h.002a.267.267 0 0 0 .133-.232V5.264l-1.25.725Z"></path></svg> &nbsp; <span class="text-secondary" data-type="${key}">${data.type}: </span> ${getEllipsis(key, 20)}</p><p class="pdb-chip m-0 text-secondary" data-size="${key}">${data.size} KB</p></div><hr class="m-0"><div class="bg-white m-0 p-3 rounded"><p class="text-monospace" data-sample="${key}">${data.sample}</p><textarea wrap="off" data-textarea="${key}" rows="10" class="pdb-textarea"></textarea><p class="pdb-label-error" data-label="${key}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12" fill="#D40000"><path d="M1.757 10.243a6.001 6.001 0 1 1 8.488-8.486 6.001 6.001 0 0 1-8.488 8.486ZM6 4.763l-2-2L2.763 4l2 2-2 2L4 9.237l2-2 2 2L9.237 8l-2-2 2-2L8 2.763Z"></path></svg>&nbsp; <span data-label-title="${key}"></span></p><div class="d-flex justify-content-end"><button class="pdb-button align-items-center mt-3" onclick="modify('${key}')" data-menu="${key}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M6.122.392a1.75 1.75 0 0 1 1.756 0l5.25 3.045c.54.313.872.89.872 1.514V7.25a.75.75 0 0 1-1.5 0V5.677L7.75 8.432v6.384a1 1 0 0 1-1.502.865L.872 12.563A1.75 1.75 0 0 1 0 11.049V4.951c0-.624.332-1.2.872-1.514ZM7.125 1.69a.248.248 0 0 0-.25 0l-4.63 2.685L7 7.133l4.755-2.758ZM1.5 11.049a.25.25 0 0 0 .125.216l4.625 2.683V8.432L1.5 5.677Zm11.672-.282L11.999 12h3.251a.75.75 0 0 1 0 1.5h-3.251l1.173 1.233a.75.75 0 1 1-1.087 1.034l-2.378-2.5a.75.75 0 0 1 0-1.034l2.378-2.5a.75.75 0 0 1 1.087 1.034Z"></path></svg>&nbsp; Edit</button></div><div class="justify-content-end gap-2 mt-3" data-buttons="${key}"><button class="pdb-button-success d-flex align-items-center" onclick="commit('${key}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="white"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path></svg>&nbsp; Commit changes <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="pdb-spinner ms-1" fill="white" data-spinner="${key}"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25"/><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"/></svg></button><button class="pdb-button d-flex align-items-center" onclick="dismiss('${key}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.273a.75.75 0 0 1 1.06 0l.97.97.97-.97a.748.748 0 0 1 1.265.332.75.75 0 0 1-.205.729l-.97.97.97.97a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-.97-.97-.97.97a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l.97-.97-.97-.97a.75.75 0 0 1 0-1.06ZM2.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM3.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path></svg>&nbsp; Cancel</button></div></div></div></div>`;
  }
  $("#dashboard-list").html(html);
}

function modify(key) {
  if(requests > 5) {
    $("#dashboard-input, #dashboard-buttons > button, #dashboard-menu > button, [data-textarea], [data-menu], [data-buttons]").prop("disabled", true);
    $("#security-alert").show();
    unblock();
    return;
  }
  if(key == null) {
    $("#dashboard-menu").hide();
    $("#dashboard-buttons").css("display", "flex");
    $("#dashboard-input").val("").show();
    return;
  }
  $(`[data-menu="${key}"], [data-sample="${key}"]`).hide();
  $(`[data-textarea="${key}"]`).val(JSON.stringify(datablob[key].value, null, 2)).show();
  $(`[data-buttons="${key}"]`).css("display", "flex");
}

function dismiss(key) {
  if(key == null) {
    $("#dashboard-input").removeClass("pdb-input-error").hide();
    $("#dashboard-input, #dashboard-buttons, #dashboard-label").hide();
    $("#dashboard-menu").css("display", "flex");
    return;
  }
  $(`[data-textarea="${key}"]`).removeClass("pdb-input-error");
  $(`[data-textarea="${key}"], [data-buttons="${key}"], [data-label="${key}"]`).val("").hide();
  $(`[data-sample="${key}"]`).show();
  $(`[data-menu="${key}"]`).css("display", "flex");
}

async function commit(key) {
  if(key == null) {
    $("#dashboard-input").removeClass("pdb-input-error");
    $("#dashboard-label").hide();
    let key = $("#dashboard-input").val().trim();
    if(key.length < 3) {
      $("#dashboard-label-title").text("Too short");
      $("#dashboard-input").addClass("pdb-input-error");
      $("#dashboard-label").show();
      return;
    }
    if(key.length > 30) {
      $("#dashboard-label-title").text("Too long");
      $("#dashboard-input").addClass("pdb-input-error");
      $("#dashboard-label").show();
      return;
    }
    if(/[^a-z0-9\-\_]/gi.test(key)) {
      $("#dashboard-label-title").text("Letters, numbers, dashes, and underscores only");
      $("#dashboard-input").addClass("pdb-input-error");
      $("#dashboard-label").show();
      return;
    }
    if(dataset.includes(key)) {
      $("#dashboard-label-title").text("Key name already in used");
      $("#dashboard-input").addClass("pdb-input-error");
      $("#dashboard-label").show();
      return;
    }
    $("#dashboard-input, #dashboard-buttons > button").prop("disabled", true);
    $("#dashboard-spinner").show();
    window.requests++;
    try {
      const f = await fetch(`https://pocketdb-api.vercel.app/set?key=${key}&token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: "null"
      });
      const res = await f.json();
      if(!res.success && res.error == "INTERNAL_ERROR") {
        $("#dashboard-label-title").text("Too much bytes to handle");
        $("#dashboard-input").addClass("pdb-input-error");
        $("#dashboard-label").show();
        $("#dashboard-input, #dashboard-buttons > button").prop("disabled", false);
      $("#dashboard-spinner").hide();
        return;
      } else if(!res.success) throw res;
      window.datablob[key] = {
        value: null,
        sample: null,
        size: "0.00",
        type: "Null"
      }
      window.dataset.push(key);
      window.count++;
      $("#dashboard-input, #dashboard-buttons > button").prop("disabled", false);
      $("#dashboard-spinner").hide();
      $("#dashboard-input").removeClass("pdb-input-error").hide();
      $("#dashboard-input, #dashboard-buttons, #dashboard-label").hide();
      $("#dashboard-menu").css("display", "flex");
      refresh();
    } catch(e) {
      console.error(e);
      $("#dashboard-label-title").text("Can't connect to the server");
      $("#dashboard-input").addClass("pdb-input-error");
      $("#dashboard-label").show();
      $("#dashboard-input, #dashboard-buttons > button").prop("disabled", false);
      $("#dashboard-spinner").hide();
      return;
    }
    return;
  }
  $(`[data-textarea="${key}"]`).removeClass("pdb-input-error");
  $(`[data-label="${key}"]`).hide();
  let value = $(`[data-textarea="${key}"]`).val().trim() || "null";
  try {
    value = JSON.parse(value);
    if(typeof value == "number" && !isFinite(value)) value = value < 0 ? Number.MIN_VALUE : Number.MAX_VALUE;
    $(`[data-textarea="${key}"]`).removeClass("pdb-input-error");
    $(`[data-textarea="${key}"], [data-buttons="${key}"] > button`).prop("disabled", true);
    $(`[data-spinner="${key}"]`).show();
    window.requests++;
    try {
      const f = await fetch(`https://pocketdb-api.vercel.app/set?key=${key}&token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(value)
      });
      const res = await f.json();
      if(!res.success && res.error == "INTERNAL_ERROR") {
        $(`[data-label-title="${key}"]`).text("Too much bytes to handle");
        $(`[data-textarea="${key}"]`).addClass("pdb-input-error");
        $(`[data-label="${key}"]`).show();
        $(`[data-textarea="${key}"], [data-buttons="${key}"] > button`).prop("disabled", false);
        $(`[data-spinner="${key}"]`).hide();
        return;
      } else if(!res.success) throw res;
      window.datablob[key] = {
        value: value,
        sample: typeof value == "object" ? getObjectSample(value) : getEllipsis(value, 100),
        size: getByteSize(value),
        type: getDataType(value)
      }
      refresh();
      $(`[data-textarea="${key}"]`).removeClass("pdb-input-error");
      $(`[data-textarea="${key}"], [data-buttons="${key}"], [data-label="${key}"]`).val("").hide();
      $(`[data-sample="${key}"]`).show();
      $(`[data-menu="${key}"]`).css("display", "flex");
    } catch(e) {
      console.error(e);
      $(`[data-label-title="${key}"]`).text("Can't connect to the server");
      $(`[data-textarea="${key}"]`).addClass("pdb-input-error");
      $(`[data-label="${key}"]`).show();
      $(`[data-textarea="${key}"], [data-buttons="${key}"] > button`).prop("disabled", false);
      $(`[data-spinner="${key}"]`).hide();
      return;
    }
  } catch(e) {
    $(`[data-label-title="${key}"]`).text("Invalid JSON value");
    $(`[data-textarea="${key}"]`).addClass("pdb-input-error");
    $(`[data-label="${key}"]`).show();
    return;
  }
}

function unblock() {
  var time = interval / 1000;
  var countdown = setInterval(_ => {
    time--;
    $("#security-interval").text(time);
  }, 1000);
  setTimeout(_ => {
    clearInterval(countdown);
    $("#dashboard-input, #dashboard-buttons > button, #dashboard-menu > button, [data-textarea], [data-menu], [data-buttons], #login-btn-login, #login-btn-new, #login-input").prop("disabled", false);
    $("#security-alert").hide();
    requests = 0;
    if(interval < 30000) interval += 5000;
    $("#security-interval").text(interval / 1000);
  }, interval);
}

async function newdatabase() {
  $("#login-spinner-2").show();
  $("#login-btn-login, #login-btn-new, #login-input").prop("disabled", true);
  try {
    const f = await fetch(`https://pocketdb-api.vercel.app/set?key=main`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: "{}"
    });
    const res = await f.json();
    if(!res.success) {
      requests++;
      if(requests > 5) {
        $("#security-alert").show();
        return unblock();
      }
      throw res.message;
    }
    window.token = res.result.token;
    window.dataset = res.result.list;
    window.datablob = {};
    window.count = dataset.length;
    const init = await initialize();
    if(init == false) {
      $("#login-input-2").addClass("pdb-input-error");
      $("#login-label-title-2").text("Can't connect to the server");
      $("#login-label-2").show();
      $("#login-spinner-2").hide();
      $("#security-alert").show();
      unblock();
      return;
    }
    initialize();
    refresh();
    $("#login-page").hide();
    $("#dashboard-page").show();
  } catch(e) {
    console.error(e);
    $("#login-label-title-2").text("Can't connect to the server");
    $("#login-label-2").show();
    $("#login-spinner-2").hide();
    $("#login-btn-login, #login-btn-new, #login-input").prop("disabled", false);
    return;
  }
}
