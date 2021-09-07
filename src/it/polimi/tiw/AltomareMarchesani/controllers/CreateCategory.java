package it.polimi.tiw.AltomareMarchesani.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import it.polimi.tiw.AltomareMarchesani.beans.CategoryJSON;
import it.polimi.tiw.AltomareMarchesani.dao.CategoryDAO;

@WebServlet("/CreateCategory")
public class CreateCategory extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public CreateCategory() {
		super();
	}
	
	public void init() throws ServletException {
		try {
			ServletContext context = getServletContext();
			String driver = context.getInitParameter("dbDriver");
			String url = context.getInitParameter("dbUrl");
			String user = context.getInitParameter("dbUser");
			String password = context.getInitParameter("dbPassword");
			Class.forName(driver);
			connection = DriverManager.getConnection(url, user, password);

		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			e.printStackTrace();
			throw new UnavailableException("Couldn't get db connection");
		}

	}
	
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String name = null;
		String fatherId = null;
		int fId = -1;
		
		Gson gson = new Gson();
		CategoryJSON categoryJson = gson.fromJson(request.getReader(), CategoryJSON.class);
		
		name = categoryJson.getName();
		fatherId = categoryJson.getFatherId();
		CategoryDAO cService = new CategoryDAO(connection);
		
		boolean badRequest = false;
		try {
			fId = Integer.parseInt(fatherId);
			
			// Check for empty elements
			if (name.isEmpty() || fatherId.isEmpty() || name==null || fatherId==null) {
				badRequest = true;
			}
			
			// Check for the existence of the father
			if(cService.getCategoryById(fId) == null) {
				badRequest = true;
			}
		} catch (NullPointerException | NumberFormatException | SQLException e) {
			badRequest = true;
		}
		
		if (badRequest) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing or incorrect parameters");
			return;
		}
		
		
		try {
			cService.createCategory(name);
			cService.createLink(fId, name);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "The category you entered already exists.");
		} catch (Exception e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
			return;
		}
	}
	
	@Override
	public void destroy() {
		if (connection != null) {
			try {
				connection.close();
			} catch (SQLException e){
				
			}
		}
	}
	
}
