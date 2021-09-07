/**
 * Login handler script
 */

function doLogin() {
	let username = document.getElementById("username").value;
	let pwd = document.getElementById("pwd").value;
	let loginCredentials = {};
	
	// prepare Credentials object
	loginCredentials.username = username;
	loginCredentials.pwd = pwd;
	
	if(!checkCredentials(username, pwd)) {
		alert("Invalid credentials!");
		return;
	}
	
	let httpRequest = new XMLHttpRequest();
	
	// check if httpRequest was instanciated correctly
	if(!httpRequest) {
		console.log("Error while creating XMLHttp instance!");
		return false;
	}
	
	// prepare and execute the request
	httpRequest.open("POST", "CheckLogin");
	httpRequest.setRequestHeader("Content-Type", "application/json");
	httpRequest.send(JSON.stringify(loginCredentials));
	httpRequest.onreadystatechange = function() {
		
		// check if the request is DONE
		if(httpRequest.readyState === XMLHttpRequest.DONE) {
		
			// 200 OK check
			if(httpRequest.status !== 200) {
				console.log("Something went wrong during the login...");
				console.log("Status code: " + httpRequest.status);
				
				/* ALERT THE USER SOMETHING WENT WRONG */
				alert("Login denied.");
			}
			else {
				/* REDIRECT */
				window.location.href = "Home.html";
			}
		}
	}
}

function checkCredentials(username, pwd) {
	if(username !== null && pwd !== null && username !== "" && pwd !== "") {
		return true;
	}
	
	return false;
}
