let apiURLs = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchAPIs();
});

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
        console.log(error);
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
        row.setAttribute('data-id', department.id);

        row.innerHTML = `
                <td>${department.id}</td>
                <td class="name">${department.name}</td>
                <td class="actions">
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
            console.log(result);

            // Optionally, you can fetch the updated list of departments
            fetchDepartments();

            // Clear the input field
            departmentNameInput.value = '';
        } catch (error) {
            console.error("Error creating department:", error);
        }
    }
});

function editDepartment(id) {
    const row = document.querySelector(`tr[data-id='${id}']`);
    if (!row) {
        console.error(`Row with data-id='${id}' not found.`);
        return;
    }
    const nameCell = row.querySelector('.name');
    const actionsCell = row.querySelector('.actions');

    const currentName = nameCell.textContent;
    nameCell.innerHTML = `<input type="text" value="${currentName}" class="edit-input">`;

    actionsCell.innerHTML = `
        <button class="save" onclick="saveDepartment(${id})">Save</button>
        <button class="cancel" onclick="cancelEdit(${id}, '${currentName}')">Cancel</button>
    `;
}

function cancelEdit(id, originalName) {
    const row = document.querySelector(`tr[data-id='${id}']`);
    if (!row) {
        console.error(`Row with data-id='${id}' not found.`);
        return;
    }
    const nameCell = row.querySelector('.name');
    const actionsCell = row.querySelector('.actions');

    nameCell.textContent = originalName;
    actionsCell.innerHTML = `
        <button class="edit" onclick="editDepartment(${id})">Edit</button>
        <button class="delete" onclick="deleteDepartment(${id})">Delete</button>
    `;
}

async function saveDepartment(id) {
    const row = document.querySelector(`tr[data-id='${id}']`);
    if (!row) {
        console.error(`Row with data-id='${id}' not found.`);
        return;
    }
    const nameInput = row.querySelector('.edit-input');
    const newName = nameInput.value.trim();

    if (newName) {
        try {
            const url = `${apiURLs.updateDepartment}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, name: newName })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const { data, message, statusCode } = result;
            if (statusCode == 201 || statusCode == 200) {
                alert(message);
            }    
            console.log(result);

            // Update the table row with the new name
            row.querySelector('.name').textContent = newName;
            row.querySelector('.actions').innerHTML = `
                <button class="edit" onclick="editDepartment(${id})">Edit</button>
                <button class="delete" onclick="deleteDepartment(${id})">Delete</button>
            `;
        } catch (error) {
            console.error("Error updating department:", error);
            alert(error.message || "Failed to update department.");
        }
    }
}