package it.polimi.tiw.AltomareMarchesani.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import it.polimi.tiw.AltomareMarchesani.beans.Category;
import it.polimi.tiw.AltomareMarchesani.dao.CategoryDAO;
import it.polimi.tiw.AltomareMarchesani.utils.CategoriesComparator;


@WebServlet("/GetCatalogue")
public class GetCatalogue extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
       
    
    public GetCatalogue() {
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

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		List<Category> allcategories = null;
		
		JSONArray categoriesJson = new JSONArray();
		
		CategoryDAO cService = new CategoryDAO(connection);
		try {
			allcategories = cService.findAllCategories();
		} catch (Exception e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Error in retrieving categories from the database");
			return;
		}
			
			
		// sort all categories list
		allcategories.sort(new CategoriesComparator());
			
			
		for(Category cat : allcategories) {
			// create a new JSON object for every top category object
			JSONObject catJson = new JSONObject();
			
			// fill topCat attributes
			catJson.put("id", cat.getId());
			catJson.put("name", cat.getName());
			catJson.put("cod", cat.getCod());
			
			
			// put JSON object into the JSON array
			categoriesJson.put(catJson);
		}
	        
	        response.setContentType("application/json");
	        response.setCharacterEncoding("UTF-8");
	        response.getWriter().write(categoriesJson.toString());
	}

	
	
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
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
