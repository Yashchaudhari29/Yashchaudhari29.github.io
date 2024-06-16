document.querySelector(".btn").addEventListener("click", function () {
  // alert('Check CV on laptop for certifications links.')
  var cvUrl = "./Yash Chaudhari.pdf";
  var link = document.createElement("a");
  link.href = cvUrl;
  link.download = "Yash Chaudhari.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.addEventListener("DOMContentLoaded", function () {
  const lorDownloadLink = document.getElementById("lor-download");
  const lorFilePath = "certi&lor/ONGC_LOR.jpg";

  lorDownloadLink.addEventListener("click", function (event) {
    event.preventDefault();
    const link = document.createElement("a");
    link.href = lorFilePath;
    link.download = "Yash_ONGC_LOR.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const certiDownloadLink = document.getElementById("ONGC-certi");
  const certiFilePath = "certi&lor/ONGC_CERTIFICATE.jpg";

  certiDownloadLink.addEventListener("click", function (event) {
    event.preventDefault();
    const link = document.createElement("a");
    link.href = certiFilePath;
    link.download = "Yash_ONGC_Certi.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
