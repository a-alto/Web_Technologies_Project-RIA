package it.polimi.tiw.AltomareMarchesani.beans;

public class SingleUpdateJSON {
	int categoryId;
	int newFatherId;
	
	public SingleUpdateJSON() {}
	
	public int getCategoryId() {
		return this.categoryId;
	}
	
	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}
	
	public int getNewFatherId() {
		return this.newFatherId;
	}
	
	public void setNewFatherId(int newFatherId) {
		this.newFatherId = newFatherId;
	}
}
