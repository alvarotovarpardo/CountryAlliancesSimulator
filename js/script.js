let countries = [];
let G = [];

function addCountry()
{
    const input = document.getElementById("countryName");
    const countryName = input.value.trim();
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