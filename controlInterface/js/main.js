let showPizzas = true
let globalCoord = []

function handleShowPizzas() {
  const list = document.getElementById("pizzaList");
  if (showPizzas) { 
    list.style.display = "block";
    showPizzas = false
    } else {
    list.style.display = "none";
    showPizzas = true
    }
}

document.querySelector('#pizzaCommand').addEventListener('submit', (e) => {
  e.preventDefault();

  const checked = document.querySelectorAll('input[name="pizza"]:checked');

  if (checked.length === 0) {
    alert("Sélectionnez au moins une pizza !");
    return;
  }

  const formData = new FormData(e.target);

  const pizzas = formData.getAll('pizza');

  const data = {
    name: formData.get('name'),
    email : formData.get("email"),
    phone : formData.get("phone"),
    pizzas: pizzas,
    address : formData.get("addressInput"),
    coords : globalCoord
  };

    fetch("http://127.0.0.1:5000/newcommand", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)        
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if (data.result === "succes") {
        alert("Commande passée avec succès !");

        document.querySelectorAll("input").forEach(input => {
          input.value = "";
        });

        document.querySelectorAll('input[name="pizza"]').forEach(checkbox => {
        checkbox.checked = false;
        });

        handleShowPizzas()
    }
    });


  console.log(data);
});

function addressAutocomplete(containerElement, callback, options) {
  let debounceTimeout;
  let currentItems = [];
  let activeIndex = -1;

  containerElement.style.position = "relative";

  const inputElement = document.createElement("input");
  inputElement.id = "addressInput"
  inputElement.autocomplete = "off"
  inputElement.name = "addressInput"
  inputElement.required = true
  inputElement.type = "text";
  inputElement.placeholder = options.placeholder || "Enter address";
  inputElement.style.width = "100%";
  inputElement.style.padding = "10px";
  inputElement.style.boxSizing = "border-box";
  containerElement.appendChild(inputElement);

  const suggestionsElement = document.createElement("div");
  suggestionsElement.style.position = "absolute";
  suggestionsElement.style.top = "100%";
  suggestionsElement.style.left = "0";
  suggestionsElement.style.width = "100%";
  suggestionsElement.style.border = "1px solid #ccc";
  suggestionsElement.style.background = "#fff";
  suggestionsElement.style.zIndex = "1000";
  suggestionsElement.style.maxHeight = "200px";
  suggestionsElement.style.overflowY = "auto";
  suggestionsElement.style.fontFamily = "Arial";
  containerElement.appendChild(suggestionsElement);

  function clearSuggestions() {
    suggestionsElement.innerHTML = "";
    currentItems = [];
    activeIndex = -1;
  }

  function setActive(index) {
    const items = suggestionsElement.querySelectorAll("div");
    items.forEach((item, i) => {
      item.style.background = i === index ? "#eee" : "#fff";
    });
    activeIndex = index;
  }

  function selectItem(feature) {
    inputElement.value = feature.properties.formatted;
    clearSuggestions();
    callback(feature);
  }

  function fetchData(value) {
    const apiKey = "377ccf1ef5fb4abda18ae2eb6e6723cf";
    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&limit=5&apiKey=${apiKey}`;

    url += "&filter=countrycode:fr"; //We can change country code for acces other country

    fetch(url)
      .then(res => res.json())
      .then(data => {
        clearSuggestions();

        if (!data.features || data.features.length === 0) return;

        currentItems = data.features;

        data.features.forEach((feature, index) => {
          const item = document.createElement("div");
          item.textContent = feature.properties.formatted;

          item.style.padding = "10px";
          item.style.cursor = "pointer";
          item.style.borderBottom = "1px solid #eee";

          item.addEventListener("mouseover", () => setActive(index));
          item.addEventListener("click", () => selectItem(feature));

          suggestionsElement.appendChild(item);
        });
      })
      .catch(err => console.error(err));
  }

  inputElement.addEventListener("input", function () {
    const value = this.value;

    clearTimeout(debounceTimeout);

    if (!value || value.length < 3) {
      clearSuggestions();
      return;
    }

    debounceTimeout = setTimeout(() => {
      fetchData(value);
    }, 300);
  });

  inputElement.addEventListener("keydown", function (e) {
    if (!currentItems.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % currentItems.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + currentItems.length) % currentItems.length);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectItem(currentItems[activeIndex]);
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!containerElement.contains(e.target)) {
      clearSuggestions();
    }
  });
}

addressAutocomplete(
  document.getElementById("autocomplete-container"),
  (selectedAddress) => {
    console.log("Adresse :", selectedAddress.properties.formatted);

    const lat = selectedAddress.properties.lat;
    const lon = selectedAddress.properties.lon;

    destinationCoords = [lon, lat]
    globalCoord = [lon, lat]
    console.log("Coords :", destinationCoords);

   fetch("http://127.0.0.1:5000/timetravel", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    destination: destinationCoords
  })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      alert("Livraison impossible, entrez une adresse valide");

      const input = document.getElementById("addressInput");
      input.value = "";
      return;
    }

    console.log("Durée :", data.duration);
    console.log("Distance :", data.distance);
  })
  .catch(err => {
    console.error(err);
    alert("Erreur serveur");
  });
  },
  {
    placeholder: "Entre une adresse..."
  }
);
