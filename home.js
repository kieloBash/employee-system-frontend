function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "index.html";
    }
}

document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});

function fetchEmployees() {
    fetch("http://localhost:8080/api/v1/employees", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(response => response.json())
    .then(employees => {
        console.log(first)
        const tableBody = document.getElementById("employee-table");
        tableBody.innerHTML = "";
        employees.forEach(emp => {
            tableBody.innerHTML += `
                <tr>
                    <td>${emp.employeeId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.dateOfBirth}</td>
                    <td>${emp.salary}</td>
                    <td>${emp.department}</td>

                </tr>
            `;
        });
    });
}

document.getElementById("fetch-employees").addEventListener("click", fetchEmployees);
fetchEmployees();

{/* <th>Employee ID</th>
<th>Name</th>
<th>Date of Birth</th>
<th>Salary</th>
<th>Department</th> */}