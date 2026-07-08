let countries = [];
let G = [];
let currentStates = [];

function addCountry()
{
    const countryName = 'A' + (countries.length + 1);
    countries.push(countryName);
    currentStates.push(1); // init state
    
    const newSize = countries.length;
    let newRow = new Array(newSize).fill(0);
    G.push(newRow);
    for (let i = 0; i < newSize - 1; i++) {
        G[i].push(0);
    }
    updateMatrix();
    drawGraph();
}

function renameCountry(index)
{
    const current = countries[index];
    const nextName = prompt("Enter new name for " + current, current);
    if(nextName == null) return;

    const newName = nextName.trim();
    if(!newName){
        alert("Name cannot be empty.");
        return;
    }

    const duplicated = countries.some((c, i) => i !== index && c.toLowerCase() === newName.toLowerCase());
    if(duplicated){
        alert("Name already exists.");
        return;
    }

    countries[index] = newName;
    updateMatrix();
    drawGraph();
}

function updateMatrix() {
    const container = document.getElementById("matrixContainer");
    
    if (countries.length < 2) {
        container.innerHTML = "<p>Add at least 2 countries to configure alliance relations.</p>";
        return;
    }

    let html = "<table><tr><th>Country</th>";
    for (let i = 0; i < countries.length; i++) {
        html += `<th class="editable-country" onclick="renameCountry(${i})" title="Click to rename">${countries[i]}</th>`;
    }
    html += "</tr>";

    for (let i = 0; i < countries.length; i++) {
        html += `<tr><th class="editable-country" onclick="renameCountry(${i})" title="Click to rename">${countries[i]}</th>`;
        for (let j = 0; j < countries.length; j++) {
            if (i === j) {
                html += `<td class="diagonal-cell">-</td>`;
            } else if (i > j) {
                    html += `<td><input id="g-${i}-${j}" class="matrix-locked" type="number" min="-3" max="3" value="${G[i][j]}" disabled></td>`;
            } else {
                    html += `<td><input id="g-${i}-${j}" type="number" min="-3" max="3" value="${G[i][j]}" 
                             onchange="updateG(${i}, ${j}, this.value)"></td>`;
            }
        }
        html += "</tr>";
    }
    html += "</table>";
    container.innerHTML = html;
}

function updateG(i, j, value){
    if (i > j) {
        [i, j] = [j, i];
    }

    const parsed = Number(value);
        const val = Number.isFinite(parsed) ? Math.max(-3, Math.min(3, parsed)) : 0;
    G[i][j] = val;
    G[j][i] = val;

    const editedInput = document.getElementById(`g-${i}-${j}`);
    if (editedInput) {
        editedInput.value = val;
    }

    const mirrorInput = document.getElementById(`g-${j}-${i}`);
    if (mirrorInput) {
        mirrorInput.value = val;
    }

    drawGraph();
}

function randomizeMatrix() {
    if (countries.length < 2) {
        alert("Add at least 2 countries.");
        return;
    }
    
    for (let i = 0; i < countries.length; i++) {
        for (let j = i + 1; j < countries.length; j++) {
                let val = Math.floor(Math.random() * 7) - 3; //rand between -3 and 3
            G[i][j] = val;
            G[j][i] = val;
        }
    }
    updateMatrix();
    drawGraph();
}

function uniformMatrix() {
    if (countries.length < 2) {
        alert("Add at least 2 countries.");
        return;
    }
    
    for (let i = 0; i < countries.length; i++) {
        for (let j = i + 1; j < countries.length; j++) {
            let val = Math.random() < 0.5 ? 1 : -1; // random +1 or -1
            G[i][j] = val;
            G[j][i] = val;
        }
    }
    updateMatrix();
    drawGraph();
}

// Graph section
function drawGraph() {
    drawSingleGraph("edgesSvg", "nodesDiv", currentStates, true);
}

function drawOptimalGraph(optimalStates) {
    drawSingleGraph("optimalEdgesSvg", "optimalNodesDiv", optimalStates, false);
}

function drawSingleGraph(svgId, nodesDivId, states, interactive) {
    const svg = document.getElementById(svgId);
    const nodesDiv = document.getElementById(nodesDivId);

    if(!svg || !nodesDiv) return;

    svg.innerHTML = "";
    nodesDiv.innerHTML = "";

    const n = countries.length
    if(n < 1) return;

    const width = svg.parentElement.clientWidth || 400;
    const height = svg.parentElement.clientHeight || 400;
    
    const cX = width / 2;
    const cY = height / 2;

    const r = Math.min(cX, cY) - 40; 
    const nodeSize = interactive ? 50 : 35; 

    // node positions
    const positions = [];
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        const x = cX + r * Math.cos(angle);
        const y = cY + r * Math.sin(angle);
        positions.push({ x, y });
    }

    // interconecting lines
    for(let i = 0; i < n; i++) {
        for(let j = i + 1; j < n; j++) {
            if(G[i][j] !== 0) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", positions[i].x);
                line.setAttribute("y1", positions[i].y);
                line.setAttribute("x2", positions[j].x);
                line.setAttribute("y2", positions[j].y);
                line.setAttribute("stroke", G[i][j] > 0 ? "green" : "red");
                line.setAttribute("stroke-width", Math.abs(G[i][j]));
                svg.appendChild(line);

                if(G[i][j] > 0) {
                    line.setAttribute("stroke", "#2ecc71"); // green -> cooperation
                    line.setAttribute("stroke-width", Math.min(G[i][j], 5)); // width proportional to strength alliance
                } else {
                    line.setAttribute("stroke-dasharray", "#e74c3c"); // red -> conflict
                    line.setAttribute("stroke-width", Math.min(-G[i][j], 5)); // width proportional to strength conflict
                }
                svg.appendChild(line);
            }
        }
    }

    for(let i = 0; i < n; i++) {
        const node = document.createElement("div");
        node.className = `node ${states[i] === 1 ? 'state-1' : 'state-minus1'}`;
        node.style.left = `${positions[i].x}px`;
        node.style.top = `${positions[i].y}px`;
        
        if(!interactive) {
            node.style.width = `${nodeSize}px`;
            node.style.height = `${nodeSize}px`;
            node.style.fontSize = "10px";
        }
        
        node.textContent = countries[i].substring(0, 3).toUpperCase(); 
        node.title = countries[i];

        if(interactive) {
            node.onclick = () => toggleCountryState(i);
        } else {
            node.style.cursor = "default";
        }
        nodesDiv.appendChild(node);
    }
    
    if(interactive) {
        calculateCurrentCost();
    }
}

function toggleCountryState(index) {
    currentStates[index] *= -1;
    drawGraph(); 
}

function calculateCurrentCost() {
    const n = countries.length;
    let cost = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            cost += -G[i][j] * currentStates[i] * currentStates[j];
        }
    }
    document.getElementById("currentCostDisplay").textContent = cost;
}

function saveGraphAsPng() {
    if (countries.length < 1) {
        alert("Add at least 1 country to export the graph.");
        return;
    }

    const size = 400;
    const cX = 200;
    const cY = 200;
    const r = 140;

    const canvas = document.createElement("canvas");
    const scale = window.devicePixelRatio > 1 ? 2 : 1;
    canvas.width = size * scale;
    canvas.height = size * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        alert("Unable to export graph as PNG.");
        return;
    }

    ctx.scale(scale, scale);

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

    const n = countries.length;
    const positions = [];
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        positions.push({
            x: cX + r * Math.cos(angle),
            y: cY + r * Math.sin(angle)
        });
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (G[i][j] === 0) {
                continue;
            }

            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);

            if (G[i][j] > 0) {
                ctx.setLineDash([]);
                ctx.strokeStyle = "#2ecc71";
                ctx.lineWidth = Math.min(G[i][j], 5);
            } else {
                ctx.setLineDash([6, 4]);
                ctx.strokeStyle = "#e74c3c";
                ctx.lineWidth = Math.min(-G[i][j], 5);
            }
            ctx.stroke();
        }
    }

    for (let i = 0; i < n; i++) {
        const x = positions[i].x;
        const y = positions[i].y;

        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = currentStates[i] === 1 ? "#ffffff" : "#ffcccc";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = currentStates[i] === 1 ? "#3498db" : "#e74c3c";
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.font = "bold 12px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(countries[i].substring(0, 3).toUpperCase(), x, y);
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "alliance-graph.png";
    link.click();
}

// Optimization section
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
    drawOptimalGraph(bestStates);
}

function displayResults(cost, states) {
    const resultsArea = document.getElementById("resultsArea");
    const listA = document.getElementById("allianceA");
    const listB = document.getElementById("allianceB");
    const costOutput = document.getElementById("costOutput");
    const optimalGraphSection = document.getElementById("optimalGraphSection");

    if (!resultsArea || !listA || !listB || !costOutput) {
        return;
    }

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
    if(optimalGraphSection) {
        optimalGraphSection.style.display = "block";
    }
}

