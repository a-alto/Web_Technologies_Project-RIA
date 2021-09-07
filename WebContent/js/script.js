/**
 * JavaScript code for the Home page
 */
{

let jsonResponse = "";
let categories = {};
let movesToExecute = []; // array for storing data for moves that needs to be executed


document.addEventListener("DOMContentLoaded", function() {
	loadCatalogue();
}, false);


/* SERVER COMMUNICATION FUNCTIONS */

// Loads categories form the server
function loadCatalogue() {
	/* ALL CATEGORIES */
	httpRequest = null;
	httpRequest = new XMLHttpRequest();
	
	// check if httpRequest was instanciated correctly
	if(!httpRequest) {
		console.log("Error while creating XMLHttp instance!");
		return false;
	}
	
	// prepare and execute the request
	httpRequest.open("GET", "GetCatalogue");
	httpRequest.responseType = "json";
	httpRequest.send();
	httpRequest.onreadystatechange = function() {
		
		// check if the request is DONE
		if(httpRequest.readyState === XMLHttpRequest.DONE) {
		
			// 200 OK check
			if(httpRequest.status === 200) {
				
				// load the response data to the list
				jsonResponse = httpRequest.response;
				
				// register categories
				registerCategories(jsonResponse);
				
				// render the category tree
				renderCategoryTree();
				
				// destroy changes
				movesToExecute = null;
				movesToExecute = [];
				
				
				// destroy save button
				destroySaveButton();
			}
			else {
				console.log("Something went wrong during the AJAX request to the GetCatalogue servlet...");
				console.log("Status code: " + httpRequest.status);
				
				/* ALERT THE USER SOMETHING WENT WRONG */
				alert("Something went wrong during the loading of the categories...");
			}
		}
	}
}

// Adds a new category to the server
function addCategory() {
	/* GET THE INFORMATION SUBMITTED BY THE USER */
	let catObject = {}
	let name = document.getElementById("nameTextbox").value;
	let fatherId = document.getElementById("categoriesMenu").value;
	
	catObject.name = name;
	catObject.fatherId = fatherId;
	
	if(name && fatherId >= 0) {
		/* SEND THE INFORMATION TO THE SERVER */
		let httpRequest = new XMLHttpRequest();
		
		// check if httpRequest was instanciated correctly
		if(!httpRequest) {
			console.log("Error while creating XMLHttp instance!");
			return false;
		}
		
		httpRequest.open("POST", "CreateCategory"); // wait for the server response before reload the catalogue
		httpRequest.setRequestHeader("Content-Type", "application/json");
		httpRequest.send(JSON.stringify(catObject));
		httpRequest.onreadystatechange = function() {
			
			// check if the request is DONE
			if(httpRequest.readyState === XMLHttpRequest.DONE) {
			
				// 200 OK check
				if(httpRequest.status !== 200) {
					console.log("Something went wrong during the AJAX request to the CreateCategory servlet...");
					console.log("Status code: " + httpRequest.status);
					
					/* ALERT THE USER SOMETHING WENT WRONG */
					alert("Something went wrong during the creation of the new category...");
				}
				else {
					/* SHOW THE NEW CATEGORY INTO THE CATEGORY TREE */
					loadCatalogue();
				}
			}
		}
	}
	else {
		window.alert("Name or father-category invalid!");
	}
	
	
}


// Updates the category on the server
function saveCategoryUpdates() {
	console.log("Changes: " + JSON.stringify(movesToExecute));
	
	/* SEND THE INFORMATION TO THE SERVER */
	let httpRequest = new XMLHttpRequest();
	
	// check if httpRequest was instanciated correctly
	if(!httpRequest) {
		console.log("Error while creating XMLHttp instance!");
		return false;
	}
	
	httpRequest.open("POST", "UpdateCategories"); // wait for the server response before reload the catalogue
	httpRequest.setRequestHeader("Content-Type", "application/json");
	httpRequest.send(JSON.stringify(movesToExecute));
	httpRequest.onreadystatechange = function() {
		
		// check if the request is DONE
		if(httpRequest.readyState === XMLHttpRequest.DONE) {
		
			// 200 OK check
			if(httpRequest.status !== 200) {
				console.log("Something went wrong during the AJAX request to the CreateCategory servlet...");
				console.log("Status code: " + httpRequest.status);
				
				/* ALERT THE USER SOMETHING WENT WRONG */
				alert("Something went wrong during the categories update...");
			}
			else {
				/* ALERT THE USER THAT THE UPDATE IS DONE */
				alert("Categories have been updated!");
				
				/* SHOW THE UPDATES INTO THE CATEGORY TREE */
				loadCatalogue();
			}
		}
	}
}




/* UTILITY FUNCTIONS */

// Registers categories retrieved form the server
function registerCategories(jsonData) {
	categories = {};
	
	for(let elem of jsonData) {
		categories[elem.id.toString()] = {};
		categories[elem.id.toString()].id = elem.id.toString();
		categories[elem.id.toString()].cod = elem.cod;
		categories[elem.id.toString()].name = elem.name;
		categories[elem.id.toString()].updating = false; // tell if the category is being moved or not
	}
}

// Renders the category tree
function renderCategoryTree() {
	let sortedCategories = [];
	let catalogueList = document.getElementById("categoriesList");
	let categoriesMenu = document.getElementById("categoriesMenu");
	
	catalogueList.innerHTML = "Loading catalogue data...";
	
	// clear the list and the menu
	catalogueList.innerHTML = "";
	categoriesMenu.innerHTML = "";
	
	/* ORDER CATEGORIES */
	// put the elements cod in an array
	for(let elem in categories) {
		sortedCategories.push(categories[elem].cod);
	}
	// sort the array
	sortedCategories.sort();
	// now use the sorted array in the for in loop
	
	/* RENDER ELEMENTS */
	// populate the list and the menu
	for(let code of sortedCategories) {
		let elem = findElementIdByCod(code);
		let id = categories[elem].id;
		let cod = categories[elem].cod;
		let name = categories[elem].name;
		let updating = categories[elem].updating;
		
		// menu
		newOption = document.createElement("option");
		newOption.setAttribute("value", id);
		newOption.textContent = name;
		categoriesMenu.appendChild(newOption);
		
		// lsit
		let item = document.createElement("li");
		item.setAttribute("id", id);
		item.setAttribute("draggable", "true");
		item.setAttribute("ondragstart", "dragStart(event);");
		item.setAttribute("ondragend", "dragEnd(event);");
		item.setAttribute("ondragover", "allowDrop(event);");
		item.setAttribute("ondragenter", "dragEnter(event);");
		item.setAttribute("ondragleave", "dragLeave(event);");
		item.setAttribute("ondrop", "drop(event);");
		if(!updating) {
			item.appendChild(document.createTextNode(cod + " " + name));
		}
		else {
			item.appendChild(document.createTextNode("<updating> " + name));
		}
		// check if it's a top category
		if(cod.length === 1) {
			catalogueList.appendChild(item);
		}
		else {
			// take the father
			let fatherElement = document.getElementById(findElementIdByCod(cod.substring(0, cod.length - 1)));
			// create ul and li (item) elements for the new node
			let ulElement = document.createElement("ul");
			ulElement.setAttribute("id", fatherElement.getAttribute("id") + "_subparts");
			item.classList.add(fatherElement.getAttribute("id") + "_child"); // set class for the child element
			ulElement.appendChild(item);
			fatherElement.appendChild(ulElement);
		}
	}
}

// This function find an element's id by providing its cod (unique)
function findElementIdByCod(cod) {
	for(let elem in categories) {
		if(categories[elem].cod === cod) {
			return elem; // === categories[elem].id
		}
	}
	
	return -1; // didn't find anything
}



function checkLegalMove(categoryCod, newFatherCod) {
	if(newFatherCod.length < categoryCod.length || newFatherCod.substring(0, categoryCod.length) !== categoryCod) {
		return true;
	}
	else {
		return false;
	}
}

function saveMove(categoryId, newFatherId) {
	let newChange = {}
	newChange.categoryId = categoryId;
	newChange.newFatherId = newFatherId;
	
	// save it into the changes array
	movesToExecute.push(newChange);
}


function makeMove(categoryId, newFatherId) {
	let newCod = "";
	
	calculateNewCods(categoryId, newFatherId);
	renderCategoryTree();
}

function calculateNewCods(categoryId, newFatherId) {
	let categoryCod = categories[categoryId].cod;
	let newFatherCod = categories[newFatherId].cod;
	
	let lastChildCod = 1;
	let hasChildren = false; // tell if the newFather has children items or not
	
	/* IDENTIFY THE LAST CHILD OF THE NEW FATHER */
	for(let elem in categories) {
		if(categories[elem].cod.length === (newFatherCod.length + 1) && categories[elem].cod.substring(0, newFatherCod.length) === newFatherCod) {
			hasChildren = true;
			if(parseInt(categories[elem].cod.charAt(newFatherCod.length)) > lastChildCod) {
				lastChildCod = parseInt(categories[elem].cod.charAt(newFatherCod.length));
			}
		}
	}
	
	// if the last child is the very category which is being moved, no further action are required
	if(categoryCod === newFatherCod + (lastChildCod.toString())) {
		return;
	}
	
	/* CALCULATE NEW CODS FOR THE CATEGORY TO BE MOVED 
	 * (baesd on the last child previously calculated)
	 */
	if(hasChildren) {
		lastChildCod += 1;
	}
	let newChildCod = lastChildCod.toString();
	let newCategoryCod = newFatherCod + newChildCod;
	//let newElements = {};
	
	// create new element for the category being moved
	categories[categoryId].cod = newCategoryCod; // cod change
	categories[categoryId].updating = true;
	
	// modify children categories data
	let newCod = "";
	for(let elem in categories) {
		if(categories[elem].cod.length > categoryCod.length && categories[elem].cod.substring(0, categoryCod.length) === categoryCod) {
			newCod = newCategoryCod + categories[elem].cod.substring(categoryCod.length, categories[elem].cod.length);
			categories[elem].cod = newCod; // cod change
			categories[elem].updating = true;
		}
	}
}

function showSaveButton() {
	let saveBox = document.getElementById("saveBox");
	let saveButton = document.createElement("button");
	saveBox.innerHTML = "";
	saveButton.setAttribute("name", "saveButton");
	saveButton.setAttribute("onclick", "saveCategoryUpdates();");
	saveButton.innerText = "SAVE";
	saveBox.appendChild(saveButton);
}

function destroySaveButton() {
	document.getElementById("saveBox").innerHTML = "";
}




/* MOVE CATEGORY FUNCTIONS */

function dragStart(event) {
	event.dataTransfer.setData("text/plain", event.target.id);
	event.target.classList.add("toMove");
}

function dragEnd(event) {
	event.target.classList.remove("toMove");
}

// Referred to the element which the dragged element is being moved to (entring to)
function dragEnter(event) {
	event.target.classList.add("dragOver");
}

//Referred to the element which the dragged element is being moved to (leaving from)
function dragLeave(event) {
	event.target.classList.remove("dragOver");
}

function allowDrop(event) {
	event.preventDefault();
}

function drop(event) {
	// check if the element is a li tag
	if(event.target.tagName == "LI") {
		// make the move
		event.preventDefault();
		let categoryId = event.dataTransfer.getData("text/plain");
		let newFatherId = event.target.id;
		
		// check if the move is legal
		let categoryCod = categories[categoryId].cod;
		let newFatherCod = categories[newFatherId].cod;
		if(checkLegalMove(categoryCod, newFatherCod)) {
			if(confirm("Are you sure you want to make this move?")) {
				saveMove(categoryId, newFatherId);
				makeMove(categoryId, newFatherId);
				showSaveButton();
			}
		}
		else {
			alert("This move is not legal!");
		}
		
		event.target.classList.remove("dragOver"); // TODO: check if it works
	}
	else {
		return;
	}
	
	event.stopImmediatePropagation();
}

};
