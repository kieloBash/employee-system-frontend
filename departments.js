let apiURLs = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchAPIs();
});

function editDepartment(id) {
    alert(`Edit department with ID: ${id}`);
}

async function deleteDepartment(id) {
    if (!checkerAPI()) return;

    const url = `${apiURLs.deleteDepartment}/${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            const errorResult = await response.json();
            alert(errorResult.message);
            throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const { data, message, statusCode } = result;
        if (statusCode == 201 || statusCode == 200) {
            alert(message);
        }

        // Optionally, you can fetch the updated list of departments
        fetchDepartments();
    } catch (error) {
        console.log(error)
        console.error("Error deleting department:", error);
    }
}
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

        fetchDepartments();

    } catch (e) {
        console.error("Error fetching API:", e);
    }
}

function checkerAPI() {
    if (!apiURLs || !apiURLs.getDepartments) {
        console.error("Error: API URLs are not available. Please fetch the config first.");
        alert("API URLs are not available. Please try again later.");
        return false; // Exit the function early if API URLs are not available
    }
    return true;
}

async function fetchDepartments() {
    if (!checkerAPI()) return;

    const url = apiURLs.getDepartments;

    console.log(url);

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

        populateTable(data);
    } catch (error) {
        console.error("Error fetching departments:", error);
        alert("Failed to fetch departments.");
    }
}

function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "index.html";
    }
}

function populateTable(data) {
    const tableBody = document.querySelector('#departmentsTable tbody');

    tableBody.innerHTML = '';
    data.forEach(department => {
        const row = document.createElement('tr');

        row.innerHTML = `
                <td>${department.id}</td>
                <td>${department.name}</td>
                <td>
                    <button class="edit" onclick="editDepartment(${department.id})">Edit</button>
                    <button class="delete" onclick="deleteDepartment(${department.id})">Delete</button>
                </td>
            `;

        tableBody.appendChild(row);
    });
}

document.getElementById('addDepartmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const departmentNameInput = document.getElementById('departmentName');
    const newDepartmentName = departmentNameInput.value.trim();

    if (newDepartmentName) {
        try {
            const url = apiURLs.createDepartment;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newDepartmentName })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                alert(errorResult.message);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const { data, message, statusCode } = result;
            if (statusCode == 201 || statusCode == 200) {
                alert(message);
            }
            console.log(result)

            // Optionally, you can fetch the updated list of departments
            fetchDepartments();

            // Clear the input field
            departmentNameInput.value = '';
        } catch (error) {
            console.error("Error creating department:", error);
        }
    }
});

