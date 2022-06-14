// Include required libraries
const inquirer = require('inquirer')
const db = require('./db/msyql')

const Department = require("./lib/Department")
const Employee = require("./lib/Employee")
const Role = require("./lib/Role")

// Available app commands
const appCommands = [
    {
        type: 'list',
        name: 'command',
        message: "What would you like to do:",
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add Department',
            'Add Role',
            'Add Employee', 
        ],
    },
];

// Department questions 
const departmentQuestions = [
    {
        type: 'input',
        name: 'departmentName',
        message: "Enter department name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Department name is required';
            }

            return true;
        }
    },
];

// Role Questions
const roleQuestions = [
    {
        type: 'input',
        name: 'roleName',
        message: "Enter role name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Role name is required';
            }

            return true;
        }
    },
    {
        type: 'input',
        name: 'salary',
        message: "Enter role salary:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Role salary is required';
            }

            if (isNaN(input)) {
                return 'Role salary must be numeric';
            }

            return true;
        }
    },
    {
        type: 'input',
        name: 'departmentName',
        message: "Enter department name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Role department name is required';
            }

            return true;
        }
    },
];

// Employee questions
const employeeQuestions = [
    {
        type: 'input',
        name: 'firstName',
        message: "Enter employee's first name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Employee first name is required';
            }

            return true;
        }
    },
    {
        type: 'input',
        name: 'lastName',
        message: "Enter employee's last name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Employee last name is required';
            }

            return true;
        }
    },
    {
        type: 'input',
        name: 'roleName',
        message: "Enter employee's role:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Employee role is required';
            }

            return true;
        }
    },
    {
        type: 'input',
        name: 'managerFirstName',
        message: "Enter employee manager's first name: (leave blank for none)",
        default: '',
    },
    {
        type: 'input',
        name: 'managerLastName',
        message: "Enter employee manager's last name: (leave blank for none)",
        default: '',
    },
];

// Add department
function addDepartment() {
    inquirer
    .prompt(departmentQuestions) // prompt for department information
    .then((answers) => {
        let values = [answers.departmentName.toLowerCase()]
        db
        .promise().query(`INSERT INTO department (name) VALUES (?)`, values)
        .catch(console.log)

        viewAppCommands()
    })
    .catch((error) => {
      console.log(error)
    });
}

// Add role
function addRole() {
    inquirer
    .prompt(roleQuestions) // prompt for role information
    .then((answers) => {
        let values = [answers.roleName.toLowerCase(), answers.salary]

        db
        .promise().query(`SELECT id FROM department WHERE name = ?`, [answers.departmentName.toLowerCase()])
        .then( ([rows,fields]) => {
            if (rows[0] === undefined) {
                console.log("Invalid department name")
                return
            }

            // Add departemnt id to beginning of array
            values.unshift(rows[0].id)

            db
            .promise().query(`INSERT INTO role (department_id, title, salary) VALUES (?, ?, ?)`, values)
            .catch((error) => {
             console.log(error)
            })

            viewAppCommands()
        })
        .catch((error) => {
          console.log(error)
        })
    })
    .catch((error) => {
      console.log(error)
    });
}

// Add employee
function addEmployee() {
    inquirer
    .prompt(employeeQuestions) // prompt for employee information
    .then((answers) => {
        let managerId = null
        let employeeValues = [answers.firstName.toLowerCase(), answers.lastName.toLowerCase()]
        let managerValues = [answers.managerFirstName.toLowerCase(), answers.managerLastName.toLowerCase()]

        db
        .promise().query(`SELECT id FROM role WHERE title = ?`, [answers.roleName.toLowerCase()])
        .catch((error) => {
            console.log(error)
        })
        .then( ([rows,fields]) => {
            if (rows[0] === undefined) {
                console.log("Invalid role name")
                return
            }

            let roleId = rows[0].id

            // Check for manager name
            if (managerValues[0] == '' || managerValues[1] == '') {

                // Add ids to beginning of array
                employeeValues.unshift(managerId)
                employeeValues.unshift(roleId)

                console.log(employeeValues)

                db
                .promise().query(`INSERT INTO employee (role_id, manager_id, first_name, last_name) VALUES (?, ?, ?, ?)`, employeeValues)
                .catch((error) => {
                    console.log(error)
                })
            } else {
                db
                .promise().query(`SELECT id FROM employee WHERE first_name = ? AND last_name = ?`, managerValues)
                .then( ([rows,fields]) => {    
                    if (rows[0] === undefined) {
                        console.log("Manager not found...continuing")
                    } else {
                        managerId = rows[0].id
                    }

                    // Add ids to beginning of array
                    employeeValues.unshift(managerId)
                    employeeValues.unshift(roleId)

                    db
                    .promise().query(`INSERT INTO employee (role_id, manager_id, first_name, last_name) VALUES (?, ?, ?, ?)`, employeeValues)
                    .catch((error) => {
                        console.log(error)
                    })
                })

                viewAppCommands()

                .catch((error) => {
                    console.log(error)
                })
            }
        })
    })
    .catch((error) => {
      console.log(error)
    });
}

// View all departments
function viewDepartments() {
    db
    .promise().query(`SELECT * FROM department`)
    .then( ([rows,fields]) => {
        let depts = []
        rows.forEach(function(department) {
            depts.push(new Department(department.id, department.name))       
        });
        console.table(depts)

        viewAppCommands()
    })
    .catch((error) => {
        console.log(error)
    })
}

// View all roles
function viewRoles() {
    db
      .promise().query(`
        SELECT 
            r.id, 
            r.title, 
            d.name as department, 
            r.salary
        FROM 
            role r 
            JOIN department d ON r.department_id = d.id
      `)
      .then( ([rows,fields]) => {
        let roles = []
        rows.forEach(function(role) {
            roles.push(new Role(role.id, role.title, role.department, role.salary))
        });
        console.table(roles)

        viewAppCommands()
      })
      .catch((error) => {
        console.log(error)
      })
}

// View all employees
function viewEmployees() {
    db
      .promise().query(`
        SELECT
            e.id,
            e.first_name,
            e.last_name,
            r.title,
            d.name as department,
            r.salary,
            m.id as manager_id,
            m.first_name as manager_first_name,
            m.last_name as manager_last_name
        FROM
            employee e
            INNER JOIN role r on r.id = e.role_id
            INNER JOIN department d on d.id = r.department_id
            LEFT JOIN employee m on m.id = e.manager_id
      `)
      .then( ([rows,fields]) => {
        let employees = []
        rows.forEach(function(employee) {
            let managerName = employee.manager_id ? employee.manager_first_name + ' ' + employee.manager_last_name : null
            employees.push(
                new Employee(
                    employee.id, 
                    employee.first_name, 
                    employee.last_name, 
                    employee.department, 
                    employee.title, 
                    employee.salary, 
                    managerName,
                )
            )
        });
        console.table(employees)

        viewAppCommands()
      })
      .catch((error) => {
        console.log(error)
      })
}

// View app commands
function viewAppCommands() {
    inquirer
    .prompt(appCommands) // display app commands
    .then((answers) => {
        switch (answers.command) {
            case 'View All Departments':
                viewDepartments()
                break
            case 'View All Roles':
                viewRoles()
                break
            case 'View All Employees':
                viewEmployees()
                break
            case 'Add Department':
                addDepartment()
                break;
            case 'Add Employee':
                addEmployee()    
                break
            case 'Add Role':
                addRole()
                break
        }
    })
    .catch((error) => {
      console.log(error)
    });
}

// Initialize app
function init() {
    viewAppCommands()
}

init();