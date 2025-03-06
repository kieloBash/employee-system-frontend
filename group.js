// Function to get query parameter by name
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to display the query parameter value
function displayQueryParam() {
    const byParam = getQueryParam('by');
    if (byParam) {
        const paramDisplay = document.createElement('div');
        paramDisplay.textContent = `Grouped by: ${byParam}`;
        document.body.insertBefore(paramDisplay, document.getElementById('employee-groups'));
        return byParam;
    }
}

///// ******************************************
let apiURLs = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchAPIs();
});

async function fetchAPIs() {
    try {
        // Fetch the data from the API
        const res = await fetch("http://localhost:8080/api/config");

        // Ensure the response is successful
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Parse the JSON response
        const result = await res.json();

        // Log the result
        console.log(result.data);

        apiURLs = result.data;

        const param = displayQueryParam();
        fetchData(param);

    } catch (e) {
        console.error("Error fetching API:", e);
    }
}

function checkerAPI() {
    if (!apiURLs) {
        console.error("Error: API URLs are not available. Please fetch the config first.");
        alert("API URLs are not available. Please try again later.");
        return false; // Exit the function early if API URLs are not available
    }
    return true;
}
///// *******************************************

async function fetchData(groupBy) {
    if (!checkerAPI() || !groupBy) return;

    const url = `${apiURLs.getGroupedEmployees}?by=${groupBy}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorResult = await response.json();
            alert(errorResult.message);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const { message, statusCode, data } = result;
        console.log(data);
        console.log(message);

        displayEmployees(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data.");
    }
}

function displayEmployees(data) {
    const container = document.getElementById('employee-groups');
    container.innerHTML = ''; // Clear any existing content

    for (const department in data) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group';
        const groupTitle = document.createElement('h2');
        groupTitle.textContent = `Department: ${department}`;
        groupDiv.appendChild(groupTitle);

        data[department].forEach(employee => {
            const employeeDiv = document.createElement('div');
            employeeDiv.className = 'employee';
            employeeDiv.textContent = `Name: ${employee.name}, Date of Birth: ${new Date(employee.dateOfBirth).toDateString()}, Employee ID: ${employee.employeeId}, Salary: ${employee.salary}`;
            groupDiv.appendChild(employeeDiv);
        });

        container.appendChild(groupDiv);
    }
}