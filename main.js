      const projectData = [];
      let editIndex = -1;

      function openModal(index = -1) {
        editIndex = index;
        const form = document.getElementById("projectForm");
        if (index >= 0) {
          const p = projectData[index];
          form.pName.value = p.name;
          form.pInv.value = p.inv;
          form.pSV.value = p.sv;
          form.pLife.value = p.n;
          form.pOC.value = p.oc;
          form.pOCF.value = p.of;
          form.pRev.value = p.rev;
          form.pG.value = p.g;
          form.pAC.value = p.ac;
          form.pInt.value = p.i * 100;
        } else {
          form.reset();
        }
        document.getElementById("modal").style.display = "flex";
      }

      function closeModal() {
        document.getElementById("modal").style.display = "none";
      }

      document
        .getElementById("projectForm")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          const form = e.target;
          const name = form.pName.value.trim();
          const n = parseFloat(form.pLife.value);
          const i = parseFloat(form.pInt.value);
          if (!name || isNaN(n) || n <= 0 || isNaN(i) || i <= 0) {
            alert(
              "Please enter project name, life span (N), and interest rate (i). They are required and must be greater than 0."
            );
            return;
          }
          const p = {
            name: name,
            inv: parseFloat(form.pInv.value) || 0,
            sv: parseFloat(form.pSV.value) || 0,
            n: n,
            oc: parseFloat(form.pOC.value) || 0,
            of: parseFloat(form.pOCF.value) || 0,
            rev: parseFloat(form.pRev.value) || 0,
            g: parseFloat(form.pG.value) || 0,
            ac: parseFloat(form.pAC.value) || 0,
            i: i / 100,
          };
          calculateAnalysis(p);
          if (editIndex >= 0) {
            projectData[editIndex] = p;
          } else {
            projectData.push(p);
          }
          closeModal();
          renderProjects();
        });

      function compareProjects() {
        if (projectData.length === 0) {
  alert("Please add at least one project before performing a comparison.");
  return;
}

        document.getElementById("resultsBox").style.display = "block";

        if (projectData.length === 0) return;

        const resultsBox = document.getElementById("resultsBox");
        const resultsDiv = document.getElementById("results");

        resultsBox.style.display = "block"; 

        const lines = [];

        projectData.forEach((p) => {
          calculateAnalysis(p); 

          const { NPW, NEUA, BCR, ROR } = p.analysis;
          lines.push(
            `📌 ${p.name}:\n  NPW = ${NPW.toFixed(2)}\n  NEUA = ${NEUA.toFixed(
              2
            )}\n  BCR = ${BCR.toFixed(2)}\n  ROR = ${ROR.toFixed(2)}%\n`
          );
        });

        resultsDiv.textContent = lines.join("\n");
      }

      function calculateAnalysis(p) {
        const A_Pfactor = (p) =>
          (Math.pow(1 + p.i, p.n) - 1) / (p.i * Math.pow(1 + p.i, p.n));
        const P_Afactor = (p) =>
          (p.i * Math.pow(1 + p.i, p.n)) / (Math.pow(1 + p.i, p.n) - 1);
        const G_Pfactor = (p) =>
          (Math.pow(1 + p.i, p.n) - 1) / (p.i * Math.pow(1 + p.i, p.n)) -
          p.n / Math.pow(1 + p.i, p.n);

        let totalOp = 0;
        if (p.of > 0) {
          for (let y = p.of; y <= p.n; y += p.of) {
            totalOp += p.oc / Math.pow(1 + p.i, y);
          }
        }

        const PW_Rev = p.rev * A_Pfactor(p) + p.g * G_Pfactor(p);
        const PW_Cost = p.ac * ((1 - Math.pow(1 + p.i, -p.n)) / p.i);
        const PW_SV = p.sv * Math.pow(1 + p.i, -p.n);
        const NPW = -p.inv - totalOp - PW_Cost + PW_Rev + PW_SV;
        const NEUA = NPW * P_Afactor(p);
        const BCR = (PW_Rev + PW_SV) / (p.inv + totalOp + PW_Cost);
        const F = PW_Rev * Math.pow(1 + p.i, p.n) + p.sv;
        const ROR = ((F - p.inv) / p.inv) * 100;

        p.analysis = { NPW, NEUA, BCR, ROR };
      }

      function renderProjects() {
        document.getElementById("resultsBox").style.display = "none";
        
        if (chartInstance) {
          chartInstance.destroy();
          chartInstance = null;
        }
document.getElementById("comparisonChart").style.display = "none";
        const container = document.getElementById("projectContainer");
        container.innerHTML = "";
        projectData.forEach((p, index) => {
          const div = document.createElement("div");
          div.className = `project-form bg-neutral-100 m-3 p-3 rounded hover:bg-neutral-200`;

          const analysisDivId = `analysis-${index}`;

          div.innerHTML = `
            <strong>${p.name}</strong><br>
            Investment: ${p.inv}, Revenue: ${p.rev}, G: ${p.g}<br>
            <button class="bg-pink-300 hover:bg-pink-500 text-white font-bold py-1 px-3 rounded mt-1.5" onclick="openModal(${index})">Edit</button>
            <button class="bg-blue-200 hover:bg-blue-400 text-black font-bold py-1 px-2 rounded" onclick="showAnalysis('${analysisDivId}', 'NPW', ${index})">NPW</button>
            <button class="bg-blue-200 hover:bg-blue-400 text-black font-bold py-1 px-2 rounded" onclick="showAnalysis('${analysisDivId}', 'NEUA', ${index})">NEUA</button>
            <button class="bg-blue-200 hover:bg-blue-400 text-black font-bold py-1 px-2 rounded" onclick="showAnalysis('${analysisDivId}', 'BCR', ${index})">BCR</button>
            <button class="bg-blue-200 hover:bg-blue-400 text-black font-bold py-1 px-2 rounded" onclick="showAnalysis('${analysisDivId}', 'ROR', ${index})">ROR</button>
            <div id="${analysisDivId}" class="mt-2 text-sm text-gray-700"></div>
          `;
          container.appendChild(div);
        });
      }

      function showAnalysis(containerId, metric, index) {
        const container = document.getElementById(containerId);
        const value = projectData[index]?.analysis?.[metric];
        if (value !== undefined) {
          container.innerText = `${metric}: ${value.toFixed(2)}`;
        } else {
          container.innerText = `Please click 'Compare Projects' first to calculate.`;
        }
      }

      const A_Pfactor = (p) =>
        (Math.pow(1 + p.i, p.n) - 1) / (p.i * Math.pow(1 + p.i, p.n));
      const P_Afactor = (p) =>
        (p.i * Math.pow(1 + p.i, p.n)) / (Math.pow(1 + p.i, p.n) - 1);
      const F_Pfactor = (p) => 1 / Math.pow(1 + p.i, p.n);
      const G_Pfactor = (p) =>
        (Math.pow(1 + p.i, p.n) - 1) / (p.i * Math.pow(1 + p.i, p.n)) -
        p.n / Math.pow(1 + p.i, p.n);

      const results = projectData.map((p) => {
        let totalOp = 0;
        if (p.of > 0) {
          for (let y = p.of; y <= p.n; y += p.of) {
            totalOp += p.oc / Math.pow(1 + p.i, y);
          }
        }
        const PW_Rev = p.rev * A_Pfactor(p) + p.g * G_Pfactor(p);
        console.log(PW_Rev);

        const PW_Cost = p.ac * ((1 - Math.pow(1 + p.i, -p.n)) / p.i);
        const PW_SV = p.sv * Math.pow(1 + p.i, -p.n);
        const NPW = -p.inv - totalOp - PW_Cost + PW_Rev + PW_SV;
        const NEUA = NPW * P_Afactor(p);
        const BCR = (PW_Rev + PW_SV) / (p.inv + totalOp + PW_Cost);
        const F = PW_Rev * Math.pow(1 + p.i, p.n) + p.sv;
        const ROR = ((F - p.inv) / p.inv) * 100;
        return { name: p.name, NPW, NEUA, BCR, ROR };
      });

      let resultText = "Project Comparison Results:\n\n";
      results.forEach((p) => {
        resultText += `Project: ${p.name}\n  NPW: ${p.NPW.toFixed(
          2
        )}\n  NEUA: ${p.NEUA.toFixed(2)}\n  BCR: ${p.BCR.toFixed(
          2
        )}\n  ROR: ${p.ROR.toFixed(2)}%\n\n`;
      });

      document.getElementById("results").innerText = resultText;
const colorPalette = [
  "rgba(96, 165, 250, 0.6)",  // blue-400
  "rgba(34, 197, 94, 0.6)",   // green-500
  "rgba(253, 224, 71, 0.6)",  // yellow-400
  "rgba(244, 114, 182, 0.6)", // pink-400
  "rgba(148, 163, 184, 0.6)", // slate-400
  "rgba(251, 191, 36, 0.6)",  // amber-400
  "rgba(129, 140, 248, 0.6)", // indigo-400
  "rgba(134, 239, 172, 0.6)", // emerald-300
];
function getRandomColor() {
  const index = Math.floor(Math.random() * colorPalette.length);
  return colorPalette[index];
}

      let chartInstance;

      function drawChart() {
        const metric = document.getElementById("metricSelect").value;
        const labels = projectData.map((p) => p.name);
        const values = projectData.map((p) => p.analysis[metric]);

        const ctx = document.getElementById("comparisonChart").getContext("2d");
        document.getElementById("comparisonChart").style.display = "block";

        if (chartInstance) {
          chartInstance.destroy();



        }

        chartInstance = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: metric,
                data: values,
                backgroundColor: labels.map(() => getRandomColor()),

                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
plugins: {
  title: {
    display: true,
    text: `Comparison by ${metric}`,
    font: {
      size: 16,
      weight: 'bold',
    },
    color: '#1e3a8a',
    padding: {
      top: 10,
      bottom: 10
    }
  },
  legend: { display: true },
  tooltip: {
    callbacks: {
      label: function (context) {
        return `${metric}: ${context.parsed.y.toFixed(2)}`;
                  },
                },
              },
            },
          },
        });
      }
    