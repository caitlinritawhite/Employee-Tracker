//DEPENDENCIES
//---------------------------------------------------
//---------------------------------------------------
const mysql = require("mysql");
const table= require('console.table');
const inquirer=require("inquirer");


//Connecting to your mySQL database
const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    
    //Your database
    database: "employee_trackerDB"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    initialPrompt();
  });

  //Initial prompt for the user
  const initialPrompt = () =>
    inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            'View All Employees',
            'View All Departments',
            'View All Roles',
            'Add Employee',
            'Add Department',
            'Add Role',
            'Update Employee Role',
            'Exit',
          ],
        },
    ]).then(answer => {
      switch (answer.action){
      case 'View All Employees':
      viewAllEmployees();
      break;

      case 'View All Departments':
      viewAllDepartments();
      break;

      case 'View All Roles':
      viewAllRoles();
      break;

      case 'Add Employee':
      addEmployee();
      break;

      case 'Add Department':
      addDepartment();
      break;

      case 'Add Role':
      addRole();
      break;

      case 'Update Employee Role':
      updateEmployeeRole();
      break;

      case 'Exit':
        console.log("Thanks for using my employee tracker!")
        connection.end();
      break;
    }
    });

    //View all employees function
    const viewAllEmployees = () => {
      //Connect to the Query
      connection.query(
        `
        SELECT
          employee.id,
          employee.first_name AS 'First Name',
          employee.last_name AS 'Last Name',
          role.title AS 'Title',
          department.name AS 'Department',
          role.salary AS 'Salary',
          CONCAT(e.first_name, ' ', e.last_name) AS 'Manager'
          FROM employee
          INNER JOIN role ON employee.role_id = role.id
          LEFT JOIN department ON role.department_id = department.id
          LEFT JOIN employee e ON employee.manager_id = e.id
          ORDER BY employee.id;
          `,
          (err,res) => {
            if (err) throw err;
            // Display query results using console.table
            console.table(res);
            initialPrompt();
          }
      )};
    
    const viewAllDepartments = () => {
      //Connect to the Query
      connection.query(
        'SELECT id, name AS department FROM department',
        (err,res) => {
          if (err) throw err;
          console.table(res);
          initialPrompt()
        }
      );
      };
      //View all roles function
      const viewAllRoles = () => {
        //Connect to the Query
        connection.query(
          `
          SELECT
            role.id,
            role.title AS 'Title',
            role.salary AS 'Salary',
            department.name AS 'Department'
            FROM role
            LEFT JOIN department ON role.department_id = department.id;
            `,
            (err,res) => {
              if (err) throw err;

              console.table(res)
              initialPrompt()
            }
        );
      };

    // Add Employee function
    const addEmployee = () => 
    inquirer.prompt([
      {
        type: 'input',
        name: 'employeeFirstName',
        message: 'Enter the first name of the new employee:',
      },
      {
        type: 'input',
        name: 'employeeLastName',
        message: 'Enter the last name of the new employee:',
      },
      {
        type: 'input',
        name: 'employeeRole',
        message: 'Enter Role ID of the new employee',
      },
      {
        type: 'input',
        name: 'employeeManagerId',
        message: 'Enter Manager Id of the new employee',

      },
    ]).then(answer => {
      connection.query(
        'INSERT INTO employee SET ?',
        {
          first_name: answer.employeeFirstName,
          last_name: answer.employeeLastName,
          role_id: answer.employeeRole,
          manager_id: answer.employeeManagerId,
        },
        function(err, res) {
          if(err) throw err;
          console.log(
            `You have entered ${answer.employeeFirstName} ${answer.employeeLastName} to the database.`
          );
          initialPrompt();
        }
      );
    });

    //Add Department function

    const addDepartment = () =>
    inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'What department would you like to add?',
      },
    ]).then(answer => {
      connection.query(
        'INSERT INTO department (name) VALUES (?)',
        answer.departmentName,
        function(err, res) {
          if (err) throw err;
          console.log(
            `You have entered ${answer.departmentName} to the database.`
          );
          initialPrompt()
        }
      );
    });

    //Add role function
    const addRole = () =>
    inquirer.prompt([
      {
        type: 'input',
        name: 'addRole',
        message: 'What role would you like to add?',
      },
      {
        type: 'input',
        name: 'roleSalary',
        message: 'What is the salary for this role?',
      },
      {
        type: 'input',
        name: 'departmentId',
        message: "What is this role's department id?"
      }
    ]).then(answer => {
      connection.query(
        'INSERT INTO role SET ?',
        {
          title: answer.addRole,
          salary: answer.roleSalary,
          department_id: answer.departmentId,
        },
        function(err, res) {
          if (err) throw err;
          console.log(
            `You have entered ${answer.addRole} to your database.`
          )
          initialPrompt();
        }
      );
    });

    //Update employee role function
    const updateEmployeeRole = () => {
      const employeeArray = [];
      const roleArray = [];
      connection.query(
        `SELECT CONCAT (employee.first_name, ' ', employee.last_name) as employee FROM employee_trackerDB.employee`,
        (err, res) => {
          if(err) throw err;
          for (let i=0; i< res.length; i++) {
            employeeArray.push(res[i].employee);
          }
          connection.query(
            `SELECT title FROM employee_trackerDB.role`,
            (err, res) => {
              if(err) throw err;
              for (let i=0; i< res.length; i++) {
                roleArray.push(res[i].title);
              }
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'name',
                  message: "Who's role would you like to change?",
                  choices: employeeArray,
                },
                {
                  type: 'list',
                  name: 'role',
                  message: 'What would you like to change their role to?',
                  choices: roleArray,
                }
              ]).then(answers => {
                let currentRole;
                const name = answers.name.split(' ');
                connection.query(
                  `SELECT id FROM employee_trackerDB.role WHERE title = '${answers.role}'`,
                
                (err, res) => {
                  if(err) throw err;
                  for (let i=0; i<res.length; i++){
                    currentRole = res[i].id;
                  }
                  connection.query(
                    `UPDATE employee_trackerDB.employee SET role_id = '${currentRole}' WHERE first_name = '${name[0]}'`,
                  
                  (err,res) => {
                    if (err) throw err;
                    console.log('You have succesfully updated the role')
                    initialPrompt();
                  }
                  )
                }
                )
              }
            );
          }
        )
        }
      )
      }
    

    
  

      

    
