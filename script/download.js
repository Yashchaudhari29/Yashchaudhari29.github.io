document.querySelector(".btn").addEventListener("click", function () {
  alert('Check CV on laptop for certifications links.')
  var cvUrl = './Yash_cv.pdf';
  var link = document.createElement("a");
  link.href = cvUrl;
  link.download = "Yash CV.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
