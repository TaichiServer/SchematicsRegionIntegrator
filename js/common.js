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
    const downloadButton = document.getElementById("download");
    const closePopupButton = document.getElementById("close-popup-button");
    
    const downloadPopup = document.getElementById("dl-popup");
    const outOfPopupWindow = document.getElementById("outta-window");
    const baseSchemSelection = document.getElementById("base-schem-option");
    const baseSchemSelecting = document.getElementById("base-schem-selecting");
    const selectedRegionsList = document.getElementById("selected-reg-list");
    const dlFilename = document.getElementById("filename");
    const dlSchemname = document.getElementById("schemname");
    const dlAuthor = document.getElementById("author");
    const mergeDownload = document.getElementById("merge-dl")
    const setDownload = document.getElementById("set-dl")

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


    const clickAddRegion = () => {
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

        
        li.region = selectingReg.region;

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
    
    const displaySchemSelectOpt = () => {
        baseSchemSelection.style.display = "block";
    }
    const hideSchemSelectOpt = () => {
        baseSchemSelection.style.display = "none";
    }
    const toggleSelectionDisplay = () => {
        if (baseSchemSelection.style.display == "none") {
            displaySchemSelectOpt();
        } else {
            hideSchemSelectOpt();
        }
    }

    const setNowSelectingBaseSchem = (e) => {
        baseSchemSelecting.textContent = e.target.textContent;
        baseSchemSelecting.setAttribute("uuid", e.target.getAttribute("uuid"));

        let filename = e.target.textContent;
        if (filename.endsWith(".litematic")) {
            filename = filename.slice(0, -10);
        } else if (filename.endsWith(".nbt")) {
            filename = filename.slice(0, -4)
        }
        dlFilename.getElementsByTagName("input")[0].value = filename;

        reader.readAsArrayBuffer(
            document.querySelector(`a[uuid="${e.target.getAttribute("uuid")}"]`).file
        );
        reader.onload = () => {
            let arrayBuffer = reader.result
            let uint8View = new Uint8Array(arrayBuffer);
            if (uint8View[0] === 31 && uint8View[1] === 139) {
                arrayBuffer = pako.ungzip(arrayBuffer).buffer;
            }
            nbt.parse(arrayBuffer, (err, d) => {
                if (err) { throw err; }

                dlSchemname.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Name"].value;
                dlAuthor.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Author"].value;
            })
        }
        hideSchemSelectOpt();
    }

    uploadFileButton.addEventListener("click", async () => {
        const files = await showOpenFileDialog();
        for (let index = 0; index < files.length; index++) {
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.textContent = files[index].name;
            a.setAttribute("uuid", crypto.randomUUID());
            a.onclick = clickSchem;
            a.file = files[index];
            li.appendChild(a);
            schemList.appendChild(li);
        }
    });

    const setBaseSchem = () => {
        let firstOpt = schemList.children[0].getElementsByTagName("a")[0];
        let filename = firstOpt.textContent;
        baseSchemSelecting.innerText = filename;
        baseSchemSelecting.setAttribute("uuid", firstOpt.getAttribute("uuid"));
        
        if (filename.endsWith(".litematic")) {
            filename = filename.slice(0, -10);
        } else if (filename.endsWith(".nbt")) {
            filename = filename.slice(0, -4)
        }
        dlFilename.getElementsByTagName("input")[0].value = filename;

        reader.readAsArrayBuffer(firstOpt.file);
        reader.onload = () => {
            let arrayBuffer = reader.result
            let uint8View = new Uint8Array(arrayBuffer);
            if (uint8View[0] === 31 && uint8View[1] === 139) {
                arrayBuffer = pako.ungzip(arrayBuffer).buffer;
            }
            nbt.parse(arrayBuffer, (err, d) => {
                if (err) { throw err; }

                dlSchemname.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Name"].value;
                dlAuthor.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Author"].value;
            })
        }


        baseSchemSelection.innerHTML = "";
        for (let reg of schemList.children) {
            let opt = document.createElement("li");
            opt.textContent = reg.getElementsByTagName("a")[0].textContent;
            opt.setAttribute("uuid", reg.getElementsByTagName("a")[0].getAttribute("uuid"));
            opt.onclick = setNowSelectingBaseSchem;
            baseSchemSelection.appendChild(opt);
        }
    }
    const setSelectedRegionsToPopupList = () => {
        selectedRegionsList.innerHTML = "";

        for (let reg of selectedRegList.children) {
            let li = document.createElement("li");
            li.textContent = reg.getElementsByClassName("textinput")[0].value;
            selectedRegionsList.appendChild(li);
        }
    }

    addRegionButton.addEventListener("click", clickAddRegion);
    trashButton.addEventListener("click", trashRegion);
    baseSchemSelecting.addEventListener("click", toggleSelectionDisplay);
    document.addEventListener("click", (e) => {
        if (e.target.getAttribute("id") == "base-schem-selecting") {
            return;
        }
        hideSchemSelectOpt();
    });

    downloadButton.addEventListener("click", () => {
        try {
            setBaseSchem();
            setSelectedRegionsToPopupList();
        } catch (e) { 
            console.log(e);
            return;
        };
        downloadPopup.style.display = "block";
    });
    closePopupButton.addEventListener("click", () => {
        downloadPopup.style.display = "none";
    });
    outOfPopupWindow.addEventListener("click", () => {
        downloadPopup.style.display = "none";
    });

    const downloadFile = (file) => {
        let link = document.createElement("a");
        link.download = dlFilename.getElementsByTagName("input")[0].value + ".litematic";
        link.href = URL.createObjectURL(new Blob([file], {type: "application.octet-stream"}));
        link.dataset.downloadurl = ["application/octet-stream", link.download, link.href].join(":");
        link.click();
    }
    const mergeDownloadSchem = () => {
        let baseSchemFile = document.querySelector(`a[uuid="${baseSchemSelecting.getAttribute("uuid")}"]`).file;
        reader.readAsArrayBuffer(baseSchemFile);
        reader.onload = () => {
            let arrayBuffer = reader.result
            let uint8View = new Uint8Array(arrayBuffer);
            if (uint8View[0] === 31 && uint8View[1] === 139) {
                arrayBuffer = pako.ungzip(arrayBuffer).buffer;
            }

            nbt.parse(arrayBuffer, (err, d) => {
                if (err) { throw err; }
                for (let reg of selectedRegList.children) {
                    let indexValue = 0;
                    let existRegionNames = Object.keys(d.value["Regions"].value);
                    let regName = reg.getElementsByClassName("textinput")[0].value
                    if (existRegionNames.includes(regName)) {
                        indexValue ++;
                        while (true) {
                            if (existRegionNames.includes(regName + "_" + indexValue.toString())) {
                                indexValue ++;
                            } else {
                                regName = regName + "_" + indexValue.toString();
                                break;
                            }
                        }
                        d.value["Regions"].value[regName] = reg.region;
                    } else {
                        d.value["Regions"].value[regName] = reg.region;
                    }
                }

                d.value["Metadata"].value["Name"].value = dlSchemname.getElementsByTagName("input")[0].value;
                d.value["Metadata"].value["Author"].value = dlAuthor.getElementsByTagName("input")[0].value;

                let res = nbt.writeUncompressed({
                    name: "",
                    value: d.value
                });
                downloadFile(res);

                // dlSchemname.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Name"].value;
                // dlAuthor.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Author"].value;
            })
        }
    }
    const setDownloadSchem = () => {
        let baseSchemFile = document.querySelector(`a[uuid="${baseSchemSelecting.getAttribute("uuid")}"]`).file;
        reader.readAsArrayBuffer(baseSchemFile);
        reader.onload = () => {
            let arrayBuffer = reader.result
            let uint8View = new Uint8Array(arrayBuffer);
            if (uint8View[0] === 31 && uint8View[1] === 139) {
                arrayBuffer = pako.ungzip(arrayBuffer).buffer;
            }

            nbt.parse(arrayBuffer, (err, d) => {
                if (err) { throw err; }

                let resRegions = {};
                for (let reg of selectedRegList.children) {
                    let indexValue = 0;
                    let existRegionNames = Object.keys(resRegions);
                    let regName = reg.getElementsByClassName("textinput")[0].value
                    if (existRegionNames.includes(regName)) {
                        indexValue ++;
                        while (true) {
                            if (existRegionNames.includes(regName + "_" + indexValue.toString())) {
                                indexValue ++;
                            } else {
                                regName = regName + "_" + indexValue.toString();
                                break;
                            }
                        }
                        resRegions[regName] = reg.region;
                    } else {
                        resRegions[regName] = reg.region;
                    }
                }
                d.value["Regions"].value = resRegions;
                d.value["Metadata"].value["Name"].value = dlSchemname.getElementsByTagName("input")[0].value;
                d.value["Metadata"].value["Author"].value = dlAuthor.getElementsByTagName("input")[0].value;

                let res = nbt.writeUncompressed({
                    name: "",
                    value: d.value
                });
                downloadFile(res);

                // dlSchemname.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Name"].value;
                // dlAuthor.getElementsByTagName("input")[0].value = d.value["Metadata"].value["Author"].value;
            })
        }
    }
    mergeDownload.addEventListener("click", mergeDownloadSchem);
    setDownload.addEventListener("click", setDownloadSchem);
});
window.addEventListener("resize", fixSize)