package it.polimi.tiw.AltomareMarchesani.beans;

public class CategoryJSON {
	private String name;
	private String fatherId;
	
	public CategoryJSON() {}
	
	public String getName() {
		return this.name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getFatherId() {
		return this.fatherId;
	}
	
	public void setFatherId(String fatherId) {
		this.fatherId = fatherId;
	}
}
