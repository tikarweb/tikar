fetch("../pages/navbar.html")
.then(res => res.text())
.then(data => {
document.getElementById("navbar").innerHTML = data;
});

function bukaLatihan(nomor){
  window.location.href = "pages/latihan.html?teks=" + nomor;
}