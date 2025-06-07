const names = JSON.parse(localStorage.getItem("names")) || [];

const bgover = document.getElementById("bgover");
const done = document.getElementById("done");
const card = document.getElementById("card");
const submit = document.getElementById("submit");
const name = document.getElementById("name");
const display = document.getElementById("itemsdisplay");

document.getElementById("adding").addEventListener("click", () => {
  modal.style.display = "block";
  bgover.classList.add("blur");
});
function closeModal() {
  modal.style.display = "none";
  bgover.classList.remove("blur");
}

done.addEventListener("click", () => {
  console.log(2);
});

card.addEventListener("click", () => {
  console.log(3);
});

submit.addEventListener("click", (e) => {
  e.preventDefault();
  names.push(name.value);
  console.log(names);

  localStorage.setItem("names", JSON.stringify(names));
  rendername();
  closeModal();
});

function rendername() {
  display.innerHTML = "";

  names.forEach((n, index) => {
    const item = document.createElement("div");
    item.dataset.index = index;
    const deleted = document.createElement("button");
    deleted.innerText = "delete";
    item.innerText = n;

    deleted.addEventListener("click", () => {
      names.splice(index, 1);
      localStorage.setItem("names", JSON.stringify(names));
      rendername();
    });

    item.appendChild(deleted);
    display.appendChild(item);
    item.setAttribute("draggable", true);

    item.addEventListener("dragstart", (e) => {
      console.log(e);
      e.dataTransfer.setData("text/plain", index);
    });
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    item.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedIndex = e.dataTransfer.getData("text/plain");
      const targetIndex = e.currentTarget.dataset.index;
      [names[draggedIndex], names[targetIndex]] = [
        names[targetIndex],
        names[draggedIndex],
      ];

      localStorage.setItem("names", JSON.stringify(names));
      rendername(); // refresh list
    });
  });
}

rendername();
