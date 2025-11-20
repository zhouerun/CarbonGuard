import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract-config.js";
import { INFURA_KEY } from "./dashboard-config.js";
// ======= PROVIDER（无需钱包） =======
const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_KEY}`
);

let contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// DOM
const projectSelector = document.getElementById("projectSelector");

// charts reference (用于刷新时销毁旧图)
let trendChart, pieChart, barChart, gaugeChart;

// gauge中心百分号
// ⭐ 插件：在 Gauge 中心写字
const gaugeTextPlugin = {
    id: 'gaugeTextPlugin',
    afterDraw(chart, args, options) {
        const { ctx, chartArea: { width, height } } = chart;

        ctx.save();
        ctx.font = `${options.fontSize || 24}px Arial`;
        ctx.fillStyle = options.color || '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(options.text, width / 2, height * 0.75); // 中心位置
    }
};


async function loadAllProjects() {
    // 1. 获取总项目数量
    const total = await contract.getTotalProjects();
    const totalProjects = Number(total);
    console.log("totalProjects =", totalProjects);


    projectSelector.innerHTML = ""; // 清空下拉框

    // 2. 逐个读取 tokenId（从 1 到 totalProjects）
    for (let t = 1; t <= totalProjects; t++) {
        // 调用你的合约方法获取项目详情
        // 假设有 getProject(uint256 tokenId)
        const project = await contract.getProjectInfo(t);

        const option = document.createElement("option");
        option.value = t;

        // project.projectId 是你定义的 projectId 字段
        option.text = `Project #${t} - ${project.projectId}`;

        projectSelector.appendChild(option);
    }

    // 默认加载第 1 个项目
    if (totalProjects > 0) {
        loadProjectData(1);
    }
}


// ==========================================
// 2. 监听下拉选择 → 刷新图表
// ==========================================
projectSelector.addEventListener("change", (e) => {
    loadProjectData(e.target.value);
});


// ==========================================
// 3. 加载单个项目的数据
// ==========================================
async function loadProjectData(tokenId) {
    const p = await contract.getProjectInfo(tokenId);

    const minted = Number(p.mintedCredits);
    const retired = Number(p.retiredCredits);
    const active = minted - retired;
    const verified = Number(p.verifiedCredits);
    const tobeMinted = verified - minted;
    const rate = minted === 0 ? 0 : (retired / minted) * 100;

    document.getElementById("mintedValue").innerText = minted;
    document.getElementById("retiredValue").innerText = retired;
    document.getElementById("verifiedValue").innerText = verified;
    document.getElementById("rateValue").innerText = rate.toFixed(1) + "%";

    await loadEventsAndDrawCharts(tokenId, minted, retired, active, tobeMinted);
}



// ==========================================
// 4. 读取退休事件 + 绘图
// ==========================================
async function loadEventsAndDrawCharts(tokenId, minted, retired, active, tobeMinted) {

    const filter = contract.filters.CarbonCreditRetired(tokenId);
    const events = await contract.queryFilter(filter);

    const dateMap = {};
    const addressMap = {};

    for (let e of events) {
        const amount = Number(e.args.amount);
        const addr = e.args.retirer;

        // 从区块头取 timestamp
        const block = await provider.getBlock(e.blockNumber);
        // 按小时统计 retirement event
        const hourKey = new Date(block.timestamp * 1000)
            .toISOString()
            .slice(0, 13);  // 例如：2025-11-18T09

        dateMap[hourKey] = (dateMap[hourKey] || 0) + amount;
        addressMap[addr] = (addressMap[addr] || 0) + amount;
    }

    drawCharts(dateMap, minted, retired, active, tobeMinted, addressMap);
}



// ==========================================
// 5. 绘图函数
// ==========================================
function drawCharts(dateMap, minted, retired, active, tobeMinted, addressMap) {
    // 销毁旧图避免叠加
    trendChart?.destroy();
    pieChart?.destroy();
    barChart?.destroy();
    gaugeChart?.destroy();

    // Line chart (trend)
    trendChart = new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: Object.keys(dateMap),
            datasets: [{ data: Object.values(dateMap), borderWidth: 2, label: "Retired Amount"}]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false    // ⭐ 关键
        }

    });

    // Pie chart
    pieChart = new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: ["Retired", "Active", "To be minted"],
            datasets: [{ data: [retired, active, tobeMinted] }]
        },
        // add title
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Credit Distribution',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });

    // Bar chart (top retirers)
    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: Object.keys(addressMap).map(addr => addr.substring(0, 8)),
            datasets: [{ label: "Retired Amount", data: Object.values(addressMap) }]
        }
    });

    // Gauge chart
    const ratePercent = minted === 0 ? 0 : Math.round((retired / minted) * 100);

    gaugeChart = new Chart(document.getElementById("gaugeChart"), {
        type: "doughnut",
        data: {
            datasets: [{
                data: [retired, minted - retired],
                backgroundColor: ["#4CAF50", "#e5e5e5"]
            }]
        },
        options: {
            circumference: 180,
            rotation: 270,
            cutout: "70%",
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Retirement Rate",
                    font: { size: 16 }
                },
                gaugeTextPlugin: {
                    text: ratePercent + "%",   // ⭐ 显示百分比
                    fontSize: 28,              // ⭐ 字体大小
                    color: "#333"              // ⭐ 字体颜色
                }
            }
        },
        plugins: [gaugeTextPlugin]  // ⭐ 启用插件
    });

}

// ==========================================
// ⭐ 加载平台累计收益
// ==========================================
async function loadPlatformRevenue() {
    try {
        const revenueWei = await contract.totalFeeRevenue();
        const revenueEth = ethers.utils.formatEther(revenueWei);

        document.getElementById("platformRevenueValue").textContent =
            parseFloat(revenueEth).toFixed(6) + " ETH";

    } catch (err) {
        console.error("加载平台收益失败:", err);
    }
}


// ==========================================
// 初始化
// ==========================================
loadAllProjects();
loadPlatformRevenue();
