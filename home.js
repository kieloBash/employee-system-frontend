let apiURLs = {};
let currentPage = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchAPIs();
});

// Function to edit employee
function editEmployee(employeeId) {
    const row = document.getElementById(`row-${employeeId}`);
    const cells = row.getElementsByTagName('td');

    // Transform cells into input fields for editing
    cells[1].innerHTML = `<input type="text" value="${cells[1].innerText}" id="name-${employeeId}" />`;
    cells[2].innerHTML = `<input type="date" value="${new Date(cells[2].innerText).toISOString().split('T')[0]}" id="dob-${employeeId}" />`;
    cells[3].innerHTML = `<input type="text" value="${cells[3].innerText}" id="department-${employeeId}" />`;
    cells[4].innerHTML = `<input type="number" value="${cells[4].innerText}" id="salary-${employeeId}" />`;
    cells[5].innerHTML =
        `<button onclick="saveEmployee(${employeeId})">Save</button>
        <button onclick="cancelEdit(${employeeId})">Cancel</button>`;
}

// Function to cancel editing
function cancelEdit(employeeId) {
    fetchEmployees(); // Reload the employee list
}

// Function to save edited employee data
function saveEmployee(employeeId) {
    const name = document.getElementById(`name-${employeeId}`).value;
    const dob = document.getElementById(`dob-${employeeId}`).value;
    const department = document.getElementById(`department-${employeeId}`).value;
    const salary = document.getElementById(`salary-${employeeId}`).value;

    const updatedEmployee = {
        name,
        dateOfBirth: new Date(dob),
        employeeId,
        departmentName: department,
        salary: Number(salary)
    };

    console.log(updatedEmployee)

    fetch(`http://localhost:8080/api/v1/employees/update/${employeeId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedEmployee)
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            const { statusCode, message } = result;

            if (statusCode !== 500) {
                alert("Employee updated successfully!");
                fetchEmployees(); // Refresh employee list
            } else {
                alert(message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to update employee.");
        });
}

// Function to delete an employee
function deleteEmployee(employeeId) {
    if (confirm("Are you sure you want to delete this employee?")) {
        fetch(`http://localhost:8080/api/v1/employees/delete/${employeeId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(response => {
                if (response.ok) {
                    alert("Employee deleted successfully!");
                    fetchEmployees(); // Refresh employee list
                } else {
                    alert("Error deleting employee.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to delete employee.");
            });
    }
}

// Function to add an employee
function addEmployee(event) {
    event.preventDefault(); // Prevent form from submitting traditionally

    const formData = new FormData(event.target);
    const employeeData = {
        name: formData.get("name"),
        departmentId: formData.get("department"),
        employeeId: formData.get("employeeId"),
        salary: formData.get("salary"),
        dateOfBirth: formData.get("dateOfBirth")
    };

    // Send POST request to server to add employee
    fetch("http://localhost:8080/api/v1/employees/create", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(employeeData)
    })
        .then(response => response.json())
        .then(result => {
            if (result) {
                alert("Employee added successfully!");
                const form = document.getElementById("add-employee-form");
                form.reset();
                fetchEmployees(); // Refresh employee list after adding a new employee
            } else {
                alert("Error adding employee.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to add employee.");
        });
}

// Form submit event listener
document.getElementById("add-employee-form").addEventListener("submit", addEmployee);

// Check authentication function
function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "index.html";
    }
}

// Logout button event listener
document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});

function fetchEmployees(searchQuery = "", criteria = "", page = 0) {
    if (!apiURLs || !apiURLs.getEmployees) {
        console.error("Error: API URLs are not available. Please fetch the config first.");
        alert("API URLs are not available. Please try again later.");
        return; // Exit the function early if API URLs are not available
    }

    let url = `${apiURLs.getEmployees}?page=${page}`;
    console.log(url)

    // Check if searchQuery is provided and add the corresponding parameter
    if (searchQuery !== "") {
        url += `&name=${encodeURIComponent(searchQuery)}`;
    }

    // If criteria is provided, add it as a parameter
    if (criteria !== "" && criteria !== "all") {
        url += `&groupBy=${encodeURIComponent(criteria)}`;
    }

    fetch(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("employee-table");
            tableBody.innerHTML = "";

            console.log(data);
            const employees = data.content;
            console.log(employees)

            // Variables to compute the average salary and average age
            let avg_salary = 0;
            let avg_age = 0;
            let employeeCount = employees?.length;

            // Loop through employees and display them in the table
            employees?.forEach(emp => {
                avg_salary += emp.salary;

                // Calculate the employee's age based on dateOfBirth
                const birthDate = new Date(emp.dateOfBirth);
                const age = new Date().getFullYear() - birthDate.getFullYear();
                avg_age += age;

                // Add employee data to the table
                tableBody.innerHTML +=
                    `<tr id="row-${emp.employeeId}">
                      <td>${emp.employeeId}</td>
                      <td>${emp.name}</td>
                      <td>${birthDate.toLocaleDateString()}</td>
                      <td>${emp.department.name}</td>
                      <td>$${emp.salary?.toLocaleString()}</td>
                      <td>
                          <button onclick="editEmployee(${emp.employeeId})">Edit</button>
                          <button onclick="deleteEmployee(${emp.employeeId})">Delete</button>
                      </td>
                  </tr>`;
            });

            // Compute averages
            if (employeeCount > 0) {
                avg_salary = avg_salary / employeeCount;
                avg_age = avg_age / employeeCount;
            }

            // Display average salary and age
            const avgSalaryElement = document.getElementById("avg-salary");
            const avgAgeElement = document.getElementById("avg-age");

            if (avgSalaryElement) {
                avgSalaryElement.innerText = `Average Salary: $${parseFloat(avg_salary.toFixed(2)).toLocaleString()}`;
            }

            if (avgAgeElement) {
                avgAgeElement.innerText = `Average Age: ${Math.round(avg_age)}`;
            }

            updatePaginationControls(data);
        })
        .catch(error => {
            console.log(error)
            console.error("Error fetching employees:", error);
            alert("Failed to fetch employees.");
        });
}

// Refresh employee data on button click
document.getElementById("fetch-employees").addEventListener("click", () => fetchEmployees());

// Search employee functionality
document.getElementById("search-employee-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // const criteria = event.target.querySelector("select[name='search-criteria']").value ?? "";
    const searchName = event.target.querySelector("input[name='search-name']").value ?? "";

    console.log(searchName)
    fetchEmployees(searchName, ""); // Fetch employees filtered by search term
});

// Update pagination controls
function updatePaginationControls(data) {
    document.getElementById('page-number-input').value = data.pageable.pageNumber + 1;
    document.getElementById('prev-page-btn').disabled = data.pageable.pageNumber === 0;
    document.getElementById('next-page-btn').disabled = data.pageable.pageNumber + 1 >= data.totalPages;
}

// Handle page navigation
document.getElementById('prev-page-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        fetchEmployees("", "", currentPage);
    }
});

document.getElementById('next-page-btn').addEventListener('click', () => {
    currentPage++;
    fetchEmployees("", "", currentPage);
});

document.getElementById('page-number-input').addEventListener('change', (event) => {
    const page = parseInt(event.target.value, 10);
    if (page > 0) {
        currentPage = page;
        fetchEmployees("", "", currentPage);
    }
});



// ********************************** APIs
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

        fetchEmployees();
        fetchDepartments();
    } catch (e) {
        console.error("Error fetching API:", e);
    }
}


// FETCH DEPARTMENTS
async function fetchDepartments() {
    try {
        const res = await fetch(apiURLs.getDepartments);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        populateDropdown(result.data);
    } catch (e) {
        console.error("Error fetching departments:", e);
    }
}

// Populate the dropdown with the fetched departments
function populateDropdown(departments) {
    const dropdown = document.getElementById('departmentsDropdown');
    dropdown.innerHTML = ''; // Clear any existing options

    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department.id;
        option.textContent = department.name;
        dropdown.appendChild(option);
    });
}
