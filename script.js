document.getElementById("btn").addEventListener('click', e => {
    e.preventDefault()
    nam = document.getElementById("name").value
    textarea = document.getElementById("textarea").value
    if (!nam || !textarea) {
        alert("Please fillup the fields")
        return 0
    }

    var form = document.getElementById("form")
    form.action = "https://sheetdb.io/api/v1/i7e0yxqjhiwtx"

    try {
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form)
        }).then(
           alert("Response Recorded")
        )
            .then(res => {
                console.log(res)
            })
    }
    catch (e) {
        alert("Error:" + e)
    }

},

)

