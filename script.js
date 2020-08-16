var App;
(function() {
    let canvas = document.getElementById('mainCanvas');
    let ctx = canvas.getContext("2d");
    let imageCache = [];

    function DownloadBlob(blob, name) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = name;
        document.body.appendChild(link);
        link.dispatchEvent(
            new MouseEvent('click', { 
              bubbles: true, 
              cancelable: true, 
              view: window 
            })
        );
        document.body.removeChild(link);
    }

    function GetImageIndex(posY) {
        return Math.ceil(-posY / 360) + 1;
    }

    function DrawImage(posY) {
        let img;
        const imgIndex = GetImageIndex(posY);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(isNaN(imgIndex)) {
            return;
        }

        const imgSrc = "screens/" + imgIndex.toString() + ".png";
        for(let i = 0; i < imageCache.length; i++) {
            if(imageCache[i].src.substr(imageCache[i].src.length - imgSrc.length) === imgSrc) {
                img = imageCache[i];
                break;
            }
        }

        if(img === undefined) {
            img = new Image();
            img.addEventListener("load", function() {
                imageCache.push(img);

                ctx.drawImage(img, 0, 0);
                let x = Math.round(parseFloat(document.getElementById("X").value));
                let y = 360 - (Math.round(-parseFloat(document.getElementById("Y").value)) % 360);

                ctx.fillStyle = "green";
                ctx.fillRect(x, y, 24, 26);
            }, false);
            img.src = imgSrc;
        }
        else {
            ctx.drawImage(img, 0, 0);
            let x = Math.round(parseFloat(document.getElementById("X").value));
            let y = 360 - (Math.round(-parseFloat(document.getElementById("Y").value)) % 360);

            ctx.fillStyle = "green";
            ctx.fillRect(x, y, 24, 26);
        }
    }

    function OnFileInput(event) {
        let fileName = event.target.files[0].name;
        document.getElementsByClassName("custom-file-label")[0].innerText = fileName;

        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            let fileData = new Uint8Array(event.target.result);
            App.load(fileData);
        }, false);
        reader.readAsArrayBuffer(file);
    }

    let that = this;
    App = {
        load: function(fileData) {
            that.LoadCombined(fileData);
            document.getElementById("X").value = that.GetX();
            document.getElementById("Y").value = that.GetY();
            document.getElementById("velX").value = that.GetVelX();
            document.getElementById("velY").value = that.GetVelY();
            DrawImage(parseFloat(document.getElementById("Y").value));
        },

        save: function(e) {
            e.preventDefault();

            let x = parseFloat(document.getElementById('X').value);
            let y = parseFloat(document.getElementById('Y').value);
            if(!isNaN(x) && !isNaN(y)) {
              that.SetPosition(x, y);
            }

            let velX = parseFloat(document.getElementById('velX').value);
            let velY = parseFloat(document.getElementById('velY').value);
            if(!isNaN(velX) && !isNaN(velY)) {
              that.SetVelocity(velX, velY);
            }

            let data = new Blob([that.SaveCombined()], {type: 'application/octet-stream'});
            DownloadBlob(data, 'combined.sav');
        },

        init: function() {
            that.LoadCombined = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:LoadCombined");
            that.SaveCombined = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:SaveCombined");
            that.GetX = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:GetX");
            that.GetY = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:GetY");
            that.GetVelX = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:GetVelX");
            that.GetVelY = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:GetVelY");
            that.SetPosition = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:SetPosition");
            that.SetVelocity = Module.mono_bind_static_method("[JumpKing] JumpKing.JumpKing:SetVelocity");

            document.getElementById("loadInfo").value = "Ready!";
            document.getElementById("app").style.display = "flex";
        }
    };

    function Temp() {
        DrawImage(document.getElementById("Y").value);
    }

    document.getElementById("file-selector").addEventListener("change", OnFileInput, false);
    document.getElementById("save").addEventListener("click", App.save, false);
    document.getElementById("Y").addEventListener("input", Temp, false);
    document.getElementById("Y").addEventListener("change", Temp, false);
    document.getElementById("X").addEventListener("input", Temp, false);
    document.getElementById("X").addEventListener("change", Temp, false);
})();