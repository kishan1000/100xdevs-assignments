/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
  const express = require('express');
  const bodyParser = require('body-parser');
  
  const app = express();
  
  app.use(bodyParser.json());
  
	const fs = require("fs");
	const path = require("path");
  const filePath = path.join(__dirname, "./files/database.json");

  function writeToFile(data){
		try{
    	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
			return true;
		}
		catch(err){
			console.error("Error while writing to file");
		}
  }

  function readTheFile(){
    const data = fs.readFileSync(filePath, 'utf8');
		try{
				const jsonData = JSON.parse(data);
				return jsonData;
		}
		catch(err){
				console.error("Error parsing file data " + err);
		}
  }

	let todoList = readTheFile();
	// {"maxId": Number, "todos" : [{ "title": "Buy groceries", "completed": false, description: "I should buy groceries" }, ...]}
	// [{ "title": "Buy groceries", "completed": false, description: "I should buy groceries" }, ...]

  app.get("/todos", (req, res)=>{
    todoList = readTheFile()["todos"];
		res.json(todoList);
  });

  app.get("/todos/:id", (req, res)=>{
		todoList = readTheFile()["todos"];
		let id = req.params.id;
		try{
			id = parseInt(id);
		}
		catch(err){
			console.error("Failed to parse id to int : ", err);
			return res.status(400).send("Invalid type of id");
		}
		let todo = null;
		for(let i=0; i<todoList.length; i++){
			if(todoList[i].id == id){
				todo = todoList[i];
				break;
			}
		}

		if(todo){
			return res.status(200).json(todo)
		}
		console.log(`${id} not found while searching`);
		return res.status(404).send("Not Found");
  });

  app.post("/todos", (req, res)=>{
		maxId = readTheFile()["maxId"];
		todoList = readTheFile()["todos"];
		const todo = req.body;
		todo.id = maxId + 1;
		todoList.push(todo);
		try{
			writeToFile({"maxId" : todo.id, "todos" : todoList});
			return res.status(201).json({"id" : todo.id});
		}
		catch(err){
			console.error("Error while writing to file : " + err);
			return res.status(500).send("Internal server error");
		}
  });

	app.put("/todos/:id", (req, res)=>{
		const todoListFile = readTheFile();
		let id = req.params.id;
		try{
			id = parseInt(id);
		}
		catch(err){
			console.error("Failed to parse id to int : ", err);
			return res.status(400).send("Invalid type of id");
		}
		const todo = req.body;

		let idx;
		for(idx = 0;idx<todoListFile["todos"].length; idx++){
			if(todoListFile["todos"][idx]["id"] == id){
				break;
			}
		}

		if(idx == todoListFile["todos"].length){
			return res.status(404).send("Not Found");
		}

		if(todo["title"]){
			todoListFile["todos"][idx]["title"] = todo["title"];
		}
		if(todo["completed"]){
			todoListFile["todos"][idx]["completed"] = todo["completed"];
		}
		if(todo["description"]){
			todoListFile["todos"][idx]["description"] = todo["description"];
		}

		try{
			writeToFile(todoListFile);
			return res.status(200).json({"modified_id" : todoListFile["todos"][idx]["id"]});
		}
		catch(err){
			console.error("Error while writing to file : " + err);
			return res.status(500).send("Internal server error");
		}
  });

	app.delete("/todos/:id", (req, res)=>{
		const todoListFile = readTheFile();
		let id = req.params.id;
		try{
			id = parseInt(id);
		}
		catch(err){
			console.error("Failed to parse id to int : ", err);
			return res.status(400).send("Invalid type of id");
		}

		let idx = 0;
		let flag = true;
		const newTodo = [];
		for(;idx<todoListFile["todos"].length; idx++){
			if(todoListFile["todos"][idx]["id"] != id){
				newTodo.push(todoListFile["todos"][idx]);
			}
			else{
				flag = false;
			}
		}

		if(flag){
			return res.status(404).send("Not Found");
		}

		todoListFile["todos"] = newTodo;

		try{
			writeToFile(todoListFile);
			return res.status(200).json({"deleted_id" : id});
		}
		catch(err){
			console.error("Error while writing to file : " + err);
			return res.status(500).send("Internal server error");
		}		
  });

	app.all('*', (req, res) => {
    res.status(404).send('Route not found');
	});

	// app.listen(3000);

  module.exports = app;