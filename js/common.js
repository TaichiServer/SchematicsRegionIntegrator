function fixSize() {
    const header = document.getElementById("header");
    let main = document.getElementById("main");

    main.style.height = `${window.innerHeight - header.offsetHeight}px`
}

window.addEventListener("DOMContentLoaded", () => {
    fixSize();

    const uploadFileButton = document.getElementById("upload-file");
    const addRegionButton = document.getElementById("add-region");
    const trashButton = document.getElementById("trash");
    const fileStorage = document.getElementById("file-storage");
    const schemList = document.getElementById("schem-list");
    const regionsList = document.getElementById("regs-lists");
    const selectedRegList = document.getElementById("sel-reg-list");
    const reader = new FileReader();

    const showOpenFileDialog = () => {
        return new Promise(resolve => {
            let input = document.createElement("input");
            input.type = "file";
            input.accept = ".litematic, .nbt";
            input.multiple = true;
            input.onchange = event => { resolve(event.target.files); };
            fileStorage.appendChild(input);
            input.click();
        })
    }

    const clickAddedRegion = (e) => {
        if (e.target.tagName != "A") {
            return;
        }
        try {
            let selectingReg = document.getElementById("selecting-added-reg");
            selectingReg.removeAttribute("id");
        } catch (_) {}
        e.target.setAttribute("id", "selecting-added-reg");
        e.target.getElementsByClassName("radiosel")[0].checked = true;
    }
    const clickAddedRegRadio = (e) => {
        try {
            let selectingReg = document.getElementById("selecting-added-reg");
            selectingReg.removeAttribute("id");
        } catch (_) {}
        e.target.parentElement.setAttribute("id", "selecting-added-reg");
    }


    const clickAddRegion = (e) => {
        let selectingReg = document.getElementById("selecting-reg");
        if (selectingReg === null) { return; }
        let uuid = selectingReg.parentNode.parentNode.getAttribute("uuid");
        let parentSchem = document.querySelector(`a[uuid="${uuid}"]`);
        let schemName = parentSchem.textContent;
        if (schemName.endsWith(".litematic")) {
            schemName = schemName.slice(0, -10);
        } else if (schemName.endsWith(".nbt")) {
            schemName = schemName.slice(0, -4)
        }

        let li = document.createElement("li");
        let a = document.createElement("a");
        let input = document.createElement("input");
        let radio = document.createElement("input");

        a.onclick = clickAddedRegion;
        input.type = "text";
        input.value = `${schemName}_${selectingReg.textContent}`;
        input.classList.add("textinput");

        radio.type = "radio";
        radio.name = "added-reg-sel";
        radio.classList.add("radiosel");
        radio.onclick = clickAddedRegRadio

        // input.disabled = true;
        a.appendChild(radio);
        a.appendChild(input);
        li.appendChild(a);

        selectedRegList.appendChild(li);
    }

    const clickRegion = (e) => {
        try {
            let selectingReg = document.getElementById("selecting-reg");
            selectingReg.removeAttribute("id");
        } catch (_) {}
        e.target.setAttribute("id", "selecting-reg");
    }

    const clickSchem = (e) => {
        try {
            let openingSchem = document.getElementById("opening-schem");
            openingSchem.removeAttribute("id");
        } catch (_) {}
        e.target.setAttribute("id", "opening-schem");

        try {
            let openingReg = document.getElementById("opening-reg");
            openingReg.removeAttribute("id");
        } catch (_) {}

        let openedRegionsList = document.querySelector(`ul[uuid="${e.target.getAttribute("uuid")}"]`)
        try {
            openedRegionsList.setAttribute("id", "opening-reg");
        } catch (_) {
            reader.readAsArrayBuffer(e.target.file);
            reader.onload = () => {
                let arrayBuffer = reader.result
                let uint8View = new Uint8Array(arrayBuffer);
                if (uint8View[0] === 31 && uint8View[1] === 139) {
                    arrayBuffer = pako.ungzip(arrayBuffer).buffer;
                }
                nbt.parse(arrayBuffer, (err, d) => {
                    if (err) { throw err; }

                    let ul = document.createElement("ul");
                    ul.setAttribute("uuid", e.target.getAttribute("uuid"));
                    ul.setAttribute("id", "opening-reg");

                    let regions = d.value["Regions"].value;
                    for (key of Object.keys(regions)) {
                        let li = document.createElement("li");
                        let a = document.createElement("a");
                        a.textContent = key;
                        a.region = regions[key]
                        a.onclick = clickRegion
                        li.appendChild(a);
                        ul.appendChild(li);
                    }
                    regionsList.appendChild(ul);
                })
            }
        }
    }

    const trashRegion = (e) => {
        try {
            document.getElementById("selecting-added-reg").parentElement.remove();
        } catch (_) {}
    }

    uploadFileButton.addEventListener("click", async () => {
        const files = await showOpenFileDialog();
        for (let index = 0; index < files.length; index++) {
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.textContent = files[index].name;
            a.setAttribute("uuid", crypto.randomUUID());
            a.onclick = clickSchem
            a.file = files[index];
            li.appendChild(a);
            schemList.appendChild(li);
        }
    });
    addRegionButton.addEventListener("click", clickAddRegion);
    trashButton.addEventListener("click", trashRegion);
});
window.addEventListener("resize", fixSize)