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
            'View Department Budget',
            'Add Department',
            'Add Role',
            'Add Employee',
            'Update Employee Manager',
            'Update Employee Role',
            'Exit',
        ],
    },
]

// Department questions 
const departmentQuestions = [
    {
        type: 'input',
        name: 'departmentName',
        message: "Enter department name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Role name is required'
            }

            return true
        },
    },
]

// Employee questions
const employeeQuestions = [
    {
        type: 'input',
        name: 'firstName',
        message: "Enter employee's first name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Employee first name is required'
            }

            return true
        },
    },
    {
        type: 'input',
        name: 'lastName',
        message: "Enter employee's last name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Employee last name is required'
            }

            return true
        },
    },
    {
        type: 'list',
        name: 'roleId',
        message: "Select role:",
        choices: [],
    },
    {
        type: 'list',
        name: 'managerId',
        message: "Select manager:",
        choices: [],
    },
]

// Role Questions
const roleQuestions = [
    {
        type: 'input',
        name: 'roleName',
        message: "Enter role name:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Role name is required'
            }

            return true
        },
    },
    {
        type: 'input',
        name: 'salary',
        message: "Enter role salary:",
        default: '',
        validate: function(input) {
            if (input == null || input.trim() == '') {
                return 'Role salary is required'
            }

            if (isNaN(input)) {
                return 'Role salary must be numeric'
            }

            return true
        },
    },
    {
        type: 'list',
        name: 'departmentId',
        message: "Select department:",
        choices: [],
    },
]

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
    })
}

// Add employee
function addEmployee() {
    let roleChoices = []
    let managerChoices = []
    // Get manager question from employee questions
    let managerQuestion = employeeQuestions.pop()
    // Get role question from employee questions
    let roleQuestion = employeeQuestions.pop()

    getRoles((roles) => {

        // Get role choices
        roles.forEach((role) => {
            roleChoices.push({
                name: role.title,
                value: role.id,
            })
        })

        // Update role question choices
        roleQuestion.choices = roleChoices

        // Add question back to employee questions
        employeeQuestions.push(roleQuestion)

        // Get employee choices
        getEmployees((employees) => {
            employees.forEach((employee) => {
                managerChoices.push({
                    name: `${employee.firstName} ${employee.lastName}`,
                    value: employee.id,
                })
            })

            // Add option for no manager
            managerChoices.push({
                name: 'None',
                value: null,
            })

            // Update manager question choices
            managerQuestion.choices = managerChoices

            // Add question back to employee questions
            employeeQuestions.push(managerQuestion)

            inquirer
                .prompt(employeeQuestions) // prompt for employee information
                .then((answers) => {
                    let values = [answers.roleId, answers.managerId, answers.firstName.toLowerCase(), answers.lastName.toLowerCase()]

                    db
                        .promise().query(`INSERT INTO employee (role_id, manager_id, first_name, last_name) VALUES (?, ?, ?, ?)`, values)
                        .catch((error) => {
                            console.log(error)
                        })

                    viewAppCommands()
                })
                .catch((error) => {
                    console.log(error)
                })
        })
    })
}

// Add role
function addRole() {
    let departmentChoices = []
    // Get department question from role questions
    let departmentQuestion = roleQuestions.pop()

    getDepartments((departments) => {

        // Get department choices
        departments.forEach((department) => {
            departmentChoices.push({
                name: department.name,
                value: department.id,
            })
        })

        // Update department question choices
        departmentQuestion.choices = departmentChoices

        // Add question back to role questions
        roleQuestions.push(departmentQuestion)

        inquirer
        .prompt(roleQuestions) // prompt for role information
        .then((answers) => {
            let values = [answers.departmentId, answers.roleName.toLowerCase(), answers.salary]

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
}

// Get departments from db
function getDepartments(callback) {
    db
    .promise().query(`SELECT * FROM department`)
    .then(([rows,fields]) => {
        let departments = []
        rows.forEach(function(department) {
            departments.push(new Department(department.id, department.name))
        })
        callback(departments)
    })
    .catch((error) => {
        console.log(error)
    })
}

// Get employees from db
function getEmployees(callback) {
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
    .then(([rows,fields]) => {
        let employees = []
        rows.forEach((employee) => {
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
        })

        callback(employees)
    })
    .catch((error) => {
        console.log(error)
    })
}

// Get roles from db
function getRoles(callback) {
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
        .then(([rows,fields]) => {
            let roles = []
            rows.forEach((role) => {
                roles.push(new Role(role.id, role.title, role.department, role.salary))
            })
            callback(roles)
        })
        .catch((error) => {
            console.log(error)
        })
}

// Update employee manager
function updateEmployeeManager() {
    let employeeChoices = []
    let managerChoices = []

    // get all employees
    getEmployees((employees) => {

        employees.forEach((employee) => {
            employeeChoices.push({
                name: `${employee.firstName} ${employee.lastName}`,
                value: employee.id,
            })
        })

        inquirer
        .prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: "Select employee:",
                choices: employeeChoices,
            },
        ]) // prompt for employee information
        .then((employeeAnswers) => {

            // get all managers
            getEmployees((managers) => {
                // Get role choices
                managers.forEach((manager) => {

                    // Ensure selected employee is not an option for manager
                    if (employeeAnswers.employeeId == manager.id) {
                        return
                    }

                    managerChoices.push({
                        name: `${manager.firstName} ${manager.lastName}`,
                        value: manager.id,
                    })
                })

                managerChoices.push({
                    name: 'None',
                    value: null,
                })

                inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'managerId',
                        message: "Select manager:",
                        choices: managerChoices,
                    },
                ]) // prompt for manager information
                .then((managerAnswers) => {
                    db
                        .promise().query(`UPDATE employee SET manager_id = ? WHERE id = ?`, [managerAnswers.managerId, employeeAnswers.employeeId])
                        .catch((error) => {
                            console.log(error)
                        })

                    viewAppCommands()
                })
                .catch((error) => {
                    console.log(error)
                })
            })
        })
    })
}

// Update employee role
function updateEmployeeRole() {
    let employeeChoices = []
    let roleChoices = []

    // get all employees
    getEmployees((employees) => {

        employees.forEach((employee) => {
            employeeChoices.push({
                name: `${employee.firstName} ${employee.lastName}`,
                value: employee.id,
            })
        })

        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: "Select employee:",
                    choices: employeeChoices,
                },
            ]) // prompt for employee information
            .then((employeeAnswers) => {

                // get all roles
                getRoles((roles) => {
                    // Get role choices
                    roles.forEach((role) => {
                        roleChoices.push({
                            name: role.title,
                            value: role.id,
                        })
                    })

                    inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'roleId',
                            message: "Select role:",
                            choices: roleChoices,
                        },
                    ]) // prompt for employee information
                    .then((roleAnswers) => {
                        db
                            .promise().query(`UPDATE employee SET role_id = ? WHERE id = ?`, [roleAnswers.roleId, employeeAnswers.employeeId])
                            .catch((error) => {
                                console.log(error)
                            })

                        viewAppCommands()
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                })
            })
    })
}

// View all departments
function viewDepartments() {
    getDepartments((departments) => {
        console.table(departments)
        viewAppCommands()
    })
}

// View department budgets
function viewDepartmentBudget() {
    let departmentChoices = []

    getDepartments((departments) => {

        // Get department choices
        departments.forEach((department) => {
            departmentChoices.push({
                name: department.name,
                value: department.id,
            })
        })

        inquirer
        .prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: "Select department:",
                choices: departmentChoices,
            },
        ])
        .then((answers) => {
            db
            .promise().query(`SELECT SUM(salary) AS budget FROM role WHERE department_id = ?`, [answers.departmentId])
            .then(([rows,fields]) => {
                console.log(`$${rows[0].budget}`)
                viewAppCommands()
            })
            .catch((error) => {
                console.log(error)
            })
        })
        .catch((error) => {
            console.log(error)
        })
    })
}

// View all employees
function viewEmployees() {
    getEmployees((employees) => {
        console.table(employees)
        viewAppCommands()
    })
}

// View all roles
function viewRoles() {
    getRoles((roles) => {
        console.table(roles)
        viewAppCommands()
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
                break
            case 'View Department Budget':
                viewDepartmentBudget()
                break
            case 'Add Employee':
                addEmployee()    
                break
            case 'Add Role':
                addRole()
                break
            case 'Update Employee Manager':
                updateEmployeeManager()
                break
            case 'Update Employee Role':
                updateEmployeeRole()
                break
            case 'Exit':
                process.exit()
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