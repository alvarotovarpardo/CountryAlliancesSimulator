let countries = [];
let G = [];

function addCountry()
{
    const input = document.getElementById("countryName");
    let countryName = input.value.trim();
    if (countries.includes(countryName)) {
        alert("Country already exists!");
        return;
    } else if (countryName === "") {
        countryName = 'A' + (countries.length + 1);
    }
    countries.push(countryName);
    
    const newSize = countries.length;
    let newRow = new Array(newSize).fill(0);
    G.push(newRow);
    for (let i = 0; i < newSize - 1; i++) {
        G[i].push(0);
    }
    input.value = "";
    updateMatrix();
}

function updateMatrix() {
    const container = document.getElementById("matrixContainer");
    
    if (countries.length < 2) {
        container.innerHTML = "<p>Añade al menos dos países para configurar las relaciones.</p>";
        return;
    }

    let html = "<table><tr><th>País</th>";
    for (let i = 0; i < countries.length; i++) {
        html += `<th>${countries[i]}</th>`;
    }
    html += "</tr>";

    for (let i = 0; i < countries.length; i++) {
        html += `<tr><th>${countries[i]}</th>`;
        for (let j = 0; j < countries.length; j++) {
            if (i === j) {
                html += `<td class="diagonal-cell">-</td>`;
            } else {
                html += `<td><input type="number" value="${G[i][j]}" 
                             onchange="updateG(${i}, ${j}, this.value)"></td>`;
            }
        }
        html += "</tr>";
    }
    html += "</table>";
    container.innerHTML = html;
}

function randomizeMatrix() {
    if (countries.length < 2) {
        alert("Add at least 2 countries.");
        return;
    }
    
    for (let i = 0; i < countries.length; i++) {
        for (let j = i + 1; j < countries.length; j++) {
            let val = Math.floor(Math.random() * 11) - 5; //rand between -5 and 5   
            G[i][j] = val;
            G[j][i] = val;
        }
    }
    updateMatrix();
}

function uniformMatrix() {
    if (countries.length < 2) {
        alert("Add at least 2 countries.");
        return;
    }
    
    for (let i = 0; i < countries.length; i++) {
        for (let j = i + 1; j < countries.length; j++) {
            G[i][j] = 1;
            G[j][i] = 1;
        }
    }
    updateMatrix();
}

function calculateOptimal() {
    const n = countries.length;
    if (n < 2) {
        alert("Add at least 2 countries to calculate.");
        return;
    }

    let minCost = Infinity;
    let bestStates = [];

    // Evaluate over 2^n configurations based on bit iteration
    const totalConfigs = 1 << n;
    for (let mask = 0; mask < totalConfigs; mask++) {
        let states = [];
        for (let i = 0; i < n; i++) {
            // assign +1 or -1 depending on bit in mask
            states.push((mask & (1 << i)) ? 1 : -1);
        }

        let currentCost = 0;
        // H = - SUM(G_ij * S_i * S_j)
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                currentCost += -G[i][j] * states[i] * states[j];
            }
        }

        if (currentCost < minCost) {
            minCost = currentCost;
            bestStates = [...states];
        }
    }

    displayResults(minCost, bestStates);
}

function displayResults(cost, states) {
    const resultsArea = document.getElementById("resultsContainer");
    const listA = document.getElementById("allianceA");
    const listB = document.getElementById("allianceB");
    const costOutput = document.getElementById("costOutput");

    listA.innerHTML = "";
    listB.innerHTML = "";
    
    costOutput.innerHTML = `<strong>Minimum total cost:</strong> ${cost}`;

    for (let i = 0; i < countries.length; i++) {
        const li = document.createElement("li");
        li.textContent = countries[i];
        if (states[i] === 1) {
            listA.appendChild(li);
        } else {
            listB.appendChild(li);
        }
    }

    resultsArea.style.display = "block";
}