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

import it.polimi.tiw.AltomareMarchesani.beans.Category;
import it.polimi.tiw.AltomareMarchesani.beans.SingleUpdateJSON;
import it.polimi.tiw.AltomareMarchesani.dao.CategoryDAO;

@WebServlet("/UpdateCategories")
public class UpdateCategories extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
       
	
    public UpdateCategories() {
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

    
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		int cId  = -1;
		int tId  = -1;
		Category treeToMove;
		
		Gson gson = new Gson();
		SingleUpdateJSON[] singleUpdateJson = gson.fromJson(request.getReader(), SingleUpdateJSON[].class);
		
		for(SingleUpdateJSON update : singleUpdateJson) {
			treeToMove = null;
			boolean badRequest = false;
			
			try {
				cId = update.getNewFatherId();
				tId = update.getCategoryId();
			} catch (NumberFormatException e) {
				badRequest = true;
			}
			
			if (cId == -1 || tId == -1) {
				badRequest = true;
			}
			
			if (badRequest) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Parameter id with format number is required");
				return;
			}
			
			CategoryDAO cService = new CategoryDAO(connection);
			try {
				treeToMove = cService.getCategoryById(tId);
				Category newFather = cService.getCategoryById(cId);
				if(treeToMove == null || newFather == null) {
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Category not found");
					return;
				}
				cService.findSubparts(treeToMove);
				Category father = cService.findFather(tId);
				if(father != null) {
					cService.deleteLink(father.getId(), tId);
				}
				cService.createLink(cId, tId);
			} catch (Exception e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
						"Error in retrieving categories from the database");
				return;
			}
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
